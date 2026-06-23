export function generateContainerfile(config) {
  const sections = [
    generateFrom(config),
    generateLabels(config),
    generateHostname(config),
    generateTimezone(config),
    generateLocale(config),
    generateRepos(config),
    generatePackages(config),
    generateServices(config),
    generateFirewall(config),
    generateUsers(config),
    generateSshKeys(config),
    generateAutoUpdates(config),
    generateExtensions(config),
    generateMotd(config),
    generateLogoText(config),
  ]

  return sections.filter(Boolean).join('\n\n') + '\n'
}

function generateFrom(config) {
  const image = config.customBaseImage || config.baseImage
  return `FROM ${image}`
}

function generateLabels(config) {
  const lines = []
  if (config.osName) {
    lines.push(`LABEL org.opencontainers.image.title="${config.osName}"`)
    lines.push(`RUN sed -i 's/PRETTY_NAME=.*/PRETTY_NAME="${config.osName}"/' /etc/os-release`)
  }
  if (config.purpose) {
    lines.push(`LABEL org.opencontainers.image.description="${config.purpose}"`)
  }
  return lines.length ? lines.join('\n') : null
}

function generateHostname(config) {
  if (!config.hostname) return null
  return `RUN echo "${config.hostname}" > /etc/hostname`
}

function generateTimezone(config) {
  if (!config.timezone || config.timezone === 'UTC') return null
  return `RUN ln -sf /usr/share/zoneinfo/${config.timezone} /etc/localtime`
}

function generateLocale(config) {
  if (!config.locale || config.locale === 'en_US.UTF-8') return null
  return `RUN echo "LANG=${config.locale}" > /etc/locale.conf`
}

function generateRepos(config) {
  if (!config.customRepos.length) return null
  const blocks = config.customRepos.map((repo, i) => {
    const lines = [
      `[${repo.name}]`,
      `name=${repo.name}`,
      `baseurl=${repo.url}`,
      `enabled=1`,
    ]
    if (repo.gpgKey) {
      lines.push(`gpgcheck=1`, `gpgkey=${repo.gpgKey}`)
    } else {
      lines.push(`gpgcheck=0`)
    }
    const content = lines.map(l => `    echo '${l}'`).join(' && \\\n')
    return `RUN { \\\n${content}; \\\n    } > /etc/yum.repos.d/${repo.name}.repo`
  })
  return blocks.join('\n\n')
}

function generatePackages(config) {
  const allPkgs = [...config.packages]
  if (config.customPackages) {
    const custom = config.customPackages
      .split(/[\s,]+/)
      .map(p => p.trim())
      .filter(Boolean)
    allPkgs.push(...custom)
  }
  const shells = (config.users || [])
    .map(u => u.shell)
    .filter(s => s && s !== '/bin/bash' && s !== '/bin/sh')
    .map(s => s.split('/').pop())
  shells.forEach(s => { if (!allPkgs.includes(s)) allPkgs.push(s) })
  if (!allPkgs.length) return null

  const unique = [...new Set(allPkgs)].sort()
  if (unique.length === 1) {
    return `RUN dnf install -y ${unique[0]} && dnf clean all`
  }
  const pkgLines = unique.map(p => `    ${p}`).join(' \\\n')
  return `RUN dnf install -y \\\n${pkgLines} \\\n    && dnf clean all`
}

function generateServices(config) {
  if (!config.enabledServices.length) return null
  return `RUN systemctl enable ${config.enabledServices.join(' ')}`
}

function generateFirewall(config) {
  const cmds = []
  for (const svc of config.firewall.services) {
    cmds.push(`firewall-offline-cmd --add-service=${svc}`)
  }
  for (const port of config.firewall.ports) {
    cmds.push(`firewall-offline-cmd --add-port=${port}`)
  }
  if (!cmds.length) return null
  if (cmds.length === 1) return `RUN ${cmds[0]}`
  return `RUN ${cmds.join(' \\\n    && ')}`
}

function generateUsers(config) {
  const users = (config.users || []).filter(u => u.name)
  if (!users.length) return null

  const hasWheel = users.some(u => (u.groups || []).includes('wheel'))

  const blocks = users.map(user => {
    const cmds = []
    const groups = (user.groups || []).filter(g => g && g !== 'sudo')
    const shell = user.shell || '/bin/bash'
    const groupArg = groups.length ? ` -G ${groups.join(',')}` : ''
    cmds.push(`useradd -m${groupArg} -s ${shell} ${user.name}`)

    const pubKeys = (user.sshKeys || '')
      .split('\n')
      .map(k => k.trim())
      .filter(k => k && k.startsWith('ssh-'))
    if (pubKeys.length) {
      const home = user.name === 'root' ? '/root' : `/var/home/${user.name}`
      cmds.push(`mkdir -p ${home}/.ssh`)
      const echoLines = pubKeys.map(k => `echo '${escapeShell(k)}'`).join(' && \\\n    ')
      cmds.push(`{ ${echoLines}; } > ${home}/.ssh/authorized_keys`)
      cmds.push(`chmod 700 ${home}/.ssh`)
      cmds.push(`chmod 600 ${home}/.ssh/authorized_keys`)
      cmds.push(`chown -R ${user.name}:${user.name} ${home}/.ssh`)
    }

    if (user.passwordHash) {
      cmds.push(`echo '${user.name}:${escapeShell(user.passwordHash)}' | chpasswd -e`)
    }

    return `RUN ${cmds.join(' && \\\n    ')}`
  })

  if (hasWheel) {
    blocks.push(`RUN echo '%wheel ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/wheel-nopasswd && \\\n    chmod 440 /etc/sudoers.d/wheel-nopasswd`)
  }

  return blocks.join('\n\n')
}

function generateSshKeys(config) {
  if (!config.sshKeys?.trim()) return null
  const keys = config.sshKeys
    .split('\n')
    .map(k => k.trim())
    .filter(k => k && k.startsWith('ssh-'))
  if (!keys.length) return null
  const echoLines = keys.map(k => `echo '${escapeShell(k)}'`).join(' && \\\n    ')
  return `RUN mkdir -p /root/.ssh && \\\n    { ${echoLines}; } > /root/.ssh/authorized_keys && \\\n    chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys`
}

function generateAutoUpdates(config) {
  const strategy = config.updateStrategy
  if (!strategy || strategy === 'disabled') return null

  if (strategy === 'enabled') {
    return `RUN systemctl enable bootc-fetch-apply-updates.timer`
  }

  const onBoot = config.updateOnBootSec || '1h'
  const interval = config.updateInterval || '8h'
  return `RUN systemctl enable bootc-fetch-apply-updates.timer && \\\n    mkdir -p /usr/lib/systemd/system/bootc-fetch-apply-updates.timer.d && \\\n    printf '[Timer]\\nOnBootSec=${onBoot}\\nOnUnitInactiveSec=${interval}\\n' \\\n    > /usr/lib/systemd/system/bootc-fetch-apply-updates.timer.d/override.conf`
}

function generateExtensions(config) {
  const allExts = [...(config.extensions || [])]
  if (config.customExtensions) {
    const custom = config.customExtensions
      .split(/[\s,]+/)
      .map(e => e.trim())
      .filter(Boolean)
    allExts.push(...custom)
  }
  if (!allExts.length) return null

  const unique = [...new Set(allExts)]
  const lines = []

  lines.push(`# Extensions (sysexts): ${unique.join(', ')}`)

  lines.push(`RUN dnf install -y systemd-container && dnf clean all`)

  const configCmds = unique.map(ext =>
    `mkdir -p /etc/sysupdate.${ext}.d && \\\n    curl -sL -o /etc/sysupdate.${ext}.d/${ext}.transfer \\\n    https://extensions.fcos.fr/fedora/${ext}.conf`
  )
  lines.push(`RUN ${configCmds.join(' && \\\n    ')}`)

  const scriptLines = unique.map(ext =>
    `/usr/lib/systemd/systemd-sysupdate update --component=${ext}`
  ).join('\\n')

  lines.push(
    `RUN printf '#!/bin/bash\\nset -e\\n${scriptLines}\\nsystemctl restart systemd-sysext\\ntouch /var/lib/.sysext-firstboot-done\\n' \\\n` +
    `    > /usr/local/bin/sysext-firstboot.sh && \\\n` +
    `    chmod +x /usr/local/bin/sysext-firstboot.sh`
  )

  lines.push(
    `RUN printf '[Unit]\\nDescription=Download system extensions on first boot\\n` +
    `After=network-online.target\\nWants=network-online.target\\n` +
    `ConditionPathExists=!/var/lib/.sysext-firstboot-done\\n\\n[Service]\\nType=oneshot\\n` +
    `ExecStart=/usr/local/bin/sysext-firstboot.sh\\n\\n` +
    `[Install]\\nWantedBy=multi-user.target\\n' \\\n` +
    `    > /usr/lib/systemd/system/sysext-firstboot.service && \\\n` +
    `    systemctl enable sysext-firstboot.service`
  )

  lines.push(`RUN systemctl enable systemd-sysupdate.timer`)

  return lines.join('\n\n')
}

function generateMotd(config) {
  if (!config.motd.trim()) return null
  const lines = config.motd.split('\n')
  if (lines.length === 1) {
    return `RUN echo '${escapeShell(lines[0])}' > /etc/motd.d/banner.motd`
  }
  const echoLines = lines.map((line, i) => {
    const op = i === 0 ? '>' : '>>'
    return `    echo '${escapeShell(line)}' ${op} /etc/motd.d/banner.motd`
  })
  return `RUN ${echoLines.join(' && \\\n')}`
}

function generateLogoText(config) {
  if (config.logoMode !== 'text' || !config.logoText?.trim()) return null
  const lines = config.logoText.split('\n')
  if (lines.length === 1) {
    return `RUN mkdir -p /etc/issue.d && \\\n    echo '${escapeShell(lines[0])}' > /etc/issue.d/logo.issue`
  }
  const echoLines = lines.map((line, i) => {
    const op = i === 0 ? '>' : '>>'
    return `    echo '${escapeShell(line)}' ${op} /etc/issue.d/logo.issue`
  })
  return `RUN mkdir -p /etc/issue.d && \\\n${echoLines.join(' && \\\n')}`
}

function escapeShell(s) {
  return s.replace(/'/g, "'\\''")
}
