export function generateButane(config) {
  const doc = {
    variant: 'fcos',
    version: '1.6.0',
  }

  const passwd = generatePasswd(config)
  if (passwd) doc.passwd = passwd

  const storage = generateStorage(config)
  if (storage) doc.storage = storage

  const systemd = generateSystemd(config)
  if (systemd) doc.systemd = systemd

  return toYaml(doc)
}

function generatePasswd(config) {
  if (!config.users || config.users.length === 0) return null

  const users = config.users.map(u => {
    const user = { name: u.name }
    if (u.sshKeys) {
      const keys = u.sshKeys.split('\n').map(k => k.trim()).filter(Boolean)
      if (keys.length) user.ssh_authorized_keys = keys
    }
    if (u.passwordHash) user.password_hash = u.passwordHash
    if (u.groups && u.groups.length) user.groups = u.groups
    if (u.shell) user.shell = u.shell
    if (u.homeDir) user.home_dir = u.homeDir
    return user
  })

  return { users }
}

function generateStorage(config) {
  const storage = {}

  if (config.storageFiles && config.storageFiles.length) {
    storage.files = config.storageFiles.map(f => {
      const file = { path: f.path }
      if (f.contents) {
        file.contents = { inline: f.contents }
      }
      if (f.mode) file.mode = f.mode
      if (f.overwrite) file.overwrite = true
      return file
    })
  }

  if (config.storageDirectories && config.storageDirectories.length) {
    storage.directories = config.storageDirectories.map(d => ({
      path: d.path,
      ...(d.mode && { mode: d.mode }),
    }))
  }

  if (config.storageDisks && config.storageDisks.length) {
    storage.disks = config.storageDisks.map(d => {
      const disk = { device: d.device }
      if (d.wipeTable) disk.wipe_table = true
      if (d.partitions && d.partitions.length) {
        disk.partitions = d.partitions.map(p => ({
          label: p.label,
          ...(p.sizeMiB && { size_mib: p.sizeMiB }),
          ...(p.startMiB && { start_mib: p.startMiB }),
        }))
      }
      return disk
    })
  }

  if (config.storageFilesystems && config.storageFilesystems.length) {
    storage.filesystems = config.storageFilesystems.map(fs => ({
      device: fs.device,
      format: fs.format,
      path: fs.path,
      ...(fs.label && { label: fs.label }),
      ...(fs.wipeFilesystem && { wipe_filesystem: true }),
      ...(fs.withMountUnit && { with_mount_unit: true }),
    }))
  }

  if (config.storageLuks && config.storageLuks.length) {
    storage.luks = config.storageLuks.map(l => ({
      name: l.name,
      device: l.device,
      ...(l.keyFile && { key_file: { inline: l.keyFile } }),
    }))
  }

  if (config.storageRaid && config.storageRaid.length) {
    storage.raid = config.storageRaid.map(r => ({
      name: r.name,
      level: r.level,
      devices: r.devices,
    }))
  }

  return Object.keys(storage).length ? storage : null
}

function generateSystemd(config) {
  if (!config.systemdUnits || config.systemdUnits.length === 0) return null

  const units = config.systemdUnits.map(u => {
    const unit = { name: u.name }
    if (u.enabled !== undefined) unit.enabled = u.enabled
    if (u.contents) unit.contents = u.contents
    if (u.dropins && u.dropins.length) {
      unit.dropins = u.dropins.map(d => ({
        name: d.name,
        contents: d.contents,
      }))
    }
    return unit
  })

  return { units }
}

function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  let out = ''

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue

    if (Array.isArray(value)) {
      out += `${pad}${key}:\n`
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const entries = Object.entries(item)
          if (entries.length === 0) continue
          const [firstKey, firstVal] = entries[0]
          if (typeof firstVal === 'object' && firstVal !== null && !Array.isArray(firstVal)) {
            out += `${pad}  - ${firstKey}:\n`
            out += toYaml(firstVal, indent + 3)
          } else if (Array.isArray(firstVal)) {
            out += `${pad}  - ${firstKey}:\n`
            for (const v of firstVal) {
              out += `${pad}      - ${yamlScalar(v)}\n`
            }
          } else {
            out += `${pad}  - ${firstKey}: ${yamlScalar(firstVal)}\n`
          }
          for (const [k, v] of entries.slice(1)) {
            if (v === null || v === undefined) continue
            if (typeof v === 'object' && !Array.isArray(v)) {
              out += `${pad}    ${k}:\n`
              out += toYaml(v, indent + 3)
            } else if (Array.isArray(v)) {
              out += `${pad}    ${k}:\n`
              for (const item2 of v) {
                if (typeof item2 === 'object') {
                  const subEntries = Object.entries(item2)
                  if (subEntries.length) {
                    out += `${pad}      - ${subEntries[0][0]}: ${yamlScalar(subEntries[0][1])}\n`
                    for (const [sk, sv] of subEntries.slice(1)) {
                      out += `${pad}        ${sk}: ${yamlScalar(sv)}\n`
                    }
                  }
                } else {
                  out += `${pad}      - ${yamlScalar(item2)}\n`
                }
              }
            } else {
              out += `${pad}    ${k}: ${yamlScalar(v)}\n`
            }
          }
        } else {
          out += `${pad}  - ${yamlScalar(item)}\n`
        }
      }
    } else if (typeof value === 'object') {
      out += `${pad}${key}:\n`
      out += toYaml(value, indent + 1)
    } else {
      out += `${pad}${key}: ${yamlScalar(value)}\n`
    }
  }

  return out
}

function yamlScalar(val) {
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') {
    if (val.includes('\n')) return `|\n    ${val.split('\n').join('\n    ')}`
    if (val.match(/[:#{}[\],&*?|>!%@`]/)) return `"${val.replace(/"/g, '\\"')}"`
    return val
  }
  return String(val)
}
