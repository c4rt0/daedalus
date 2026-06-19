export const packagePresets = [
  {
    id: 'webserver',
    name: 'Web Server',
    icon: '🌐',
    packages: ['nginx', 'certbot', 'firewalld'],
    services: ['nginx', 'firewalld'],
    firewall: ['http', 'https'],
    systemdUnits: [],
  },
  {
    id: 'devworkstation',
    name: 'Dev Workstation',
    icon: '💻',
    packages: ['vim-enhanced', 'tmux', 'git', 'gcc', 'make', 'htop', 'curl', 'jq'],
    services: [],
    firewall: [],
    systemdUnits: [],
  },
  {
    id: 'desktop',
    name: 'Desktop (GNOME)',
    icon: '🖥️',
    packages: [
      '@gnome-desktop', 'firefox', 'flatpak', 'gnome-tweaks',
      'gnome-terminal', 'nautilus', 'gnome-text-editor', 'evince',
      'gnome-calculator', 'gnome-system-monitor', 'file-roller',
      'NetworkManager-wifi', 'mesa-dri-drivers', 'xdg-user-dirs',
    ],
    services: ['gdm', 'bluetooth'],
    firewall: [],
    systemdUnits: [
      {
        name: 'flatpak-add-flathub.service',
        enabled: true,
        contents: `[Unit]
Description=Add Flathub repository to Flatpak
After=network-online.target
Wants=network-online.target
ConditionPathExists=!/var/lib/.flathub-added

[Service]
Type=oneshot
ExecStart=/usr/bin/flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
ExecStartPost=/usr/bin/touch /var/lib/.flathub-added

[Install]
WantedBy=multi-user.target`,
      },
    ],
  },
  {
    id: 'desktop-kde',
    name: 'Desktop (KDE)',
    icon: '🖥️',
    packages: [
      '@kde-desktop-environment', 'firefox', 'flatpak',
      'dolphin', 'konsole', 'kate', 'okular', 'ark',
      'spectacle', 'kcalc', 'plasma-systemmonitor',
      'NetworkManager-wifi', 'mesa-dri-drivers', 'xdg-user-dirs',
    ],
    services: ['sddm', 'bluetooth'],
    firewall: [],
    systemdUnits: [
      {
        name: 'flatpak-add-flathub.service',
        enabled: true,
        contents: `[Unit]
Description=Add Flathub repository to Flatpak
After=network-online.target
Wants=network-online.target
ConditionPathExists=!/var/lib/.flathub-added

[Service]
Type=oneshot
ExecStart=/usr/bin/flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
ExecStartPost=/usr/bin/touch /var/lib/.flathub-added

[Install]
WantedBy=multi-user.target`,
      },
    ],
  },
  {
    id: 'kiosk',
    name: 'Kiosk',
    icon: '📺',
    packages: ['cage', 'wlr-randr', 'firefox'],
    services: [],
    firewall: [],
    systemdUnits: [
      {
        name: 'kiosk@.service',
        enabled: true,
        contents: `[Unit]
Description=Kiosk browser on %i
After=systemd-user-sessions.service

[Service]
Type=simple
User=kiosk
PAMName=login
Environment=XDG_RUNTIME_DIR=/run/user/%U
ExecStart=/usr/bin/cage -- /usr/bin/firefox --kiosk https://localhost

[Install]
WantedBy=multi-user.target`,
      },
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: '📊',
    packages: ['prometheus', 'grafana', 'node_exporter'],
    services: ['prometheus', 'grafana-server'],
    firewall: ['3000/tcp', '9090/tcp'],
    systemdUnits: [],
  },
  {
    id: 'minimal',
    name: 'Minimal Server',
    icon: '📦',
    packages: ['vim-minimal', 'tmux', 'curl'],
    services: [],
    firewall: [],
    systemdUnits: [],
  },
]
