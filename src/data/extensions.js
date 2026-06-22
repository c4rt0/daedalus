export const extensionCategories = [
  {
    id: 'editors',
    name: 'Editors',
    extensions: [
      { id: 'neovim', name: 'Neovim', description: 'Hyperextensible Vim fork', repo: 'fedora' },
      { id: 'vim', name: 'Vim', description: 'Classic text editor', repo: 'fedora' },
      { id: 'emacs', name: 'Emacs', description: 'Extensible text editor', repo: 'fedora' },
      { id: 'helix', name: 'Helix', description: 'Post-modern modal editor', repo: 'fedora' },
    ],
  },
  {
    id: 'shells',
    name: 'Shells & Terminal',
    extensions: [
      { id: 'zsh', name: 'Zsh', description: 'Extended Bourne shell', repo: 'fedora' },
      { id: 'fish', name: 'Fish', description: 'Friendly interactive shell', repo: 'fedora' },
      { id: 'tmux', name: 'tmux', description: 'Terminal multiplexer', repo: 'fedora' },
      { id: 'mosh', name: 'Mosh', description: 'Mobile shell for roaming SSH', repo: 'fedora' },
    ],
  },
  {
    id: 'containers',
    name: 'Containers & Kubernetes',
    extensions: [
      { id: 'kubernetes-1.33', name: 'Kubernetes 1.33', description: 'Container orchestration', repo: 'fedora' },
      { id: 'kubernetes-cri-o-1.33', name: 'CRI-O 1.33', description: 'Lightweight container runtime for K8s', repo: 'fedora' },
      { id: 'distrobox', name: 'Distrobox', description: 'Run any distro in a container', repo: 'fedora' },
      { id: 'moby-engine', name: 'Moby Engine', description: 'Open-source Docker engine', repo: 'fedora' },
      { id: 'docker-ce', name: 'Docker CE', description: 'Docker Community Edition', repo: 'community' },
      { id: 'incus', name: 'Incus', description: 'System container and VM manager', repo: 'fedora' },
    ],
  },
  {
    id: 'dev-tools',
    name: 'Development',
    extensions: [
      { id: 'python3', name: 'Python 3', description: 'Python interpreter and stdlib', repo: 'fedora' },
      { id: 'gh', name: 'GitHub CLI', description: 'GitHub from the command line', repo: 'fedora' },
      { id: 'gdb', name: 'GDB', description: 'GNU debugger', repo: 'fedora' },
      { id: 'strace', name: 'strace', description: 'System call tracer', repo: 'fedora' },
      { id: 'just', name: 'Just', description: 'Command runner (modern make)', repo: 'fedora' },
      { id: 'git-delta', name: 'git-delta', description: 'Syntax-highlighting diff pager', repo: 'fedora' },
      { id: 'git-lfs', name: 'Git LFS', description: 'Large file storage for Git', repo: 'fedora' },
    ],
  },
  {
    id: 'system',
    name: 'System Utilities',
    extensions: [
      { id: 'btop', name: 'btop', description: 'Resource monitor (top alternative)', repo: 'fedora' },
      { id: 'htop', name: 'htop', description: 'Interactive process viewer', repo: 'fedora' },
      { id: 'fastfetch', name: 'Fastfetch', description: 'System info tool (neofetch successor)', repo: 'fedora' },
      { id: 'ripgrep', name: 'ripgrep', description: 'Fast recursive grep', repo: 'fedora' },
      { id: 'fd-find', name: 'fd', description: 'Fast file finder (find alternative)', repo: 'fedora' },
      { id: 'zoxide', name: 'zoxide', description: 'Smarter cd command', repo: 'fedora' },
      { id: 'tree', name: 'tree', description: 'Directory listing as tree', repo: 'fedora' },
      { id: 'erofs-utils', name: 'erofs-utils', description: 'EROFS filesystem tools', repo: 'fedora' },
    ],
  },
  {
    id: 'networking',
    name: 'Networking & VPN',
    extensions: [
      { id: 'tailscale', name: 'Tailscale', description: 'Zero-config mesh VPN', repo: 'community' },
      { id: 'syncthing', name: 'Syncthing', description: 'Continuous file synchronization', repo: 'fedora' },
      { id: 'iwd', name: 'iwd', description: 'Intel wireless daemon', repo: 'fedora' },
      { id: 'nebula', name: 'Nebula', description: 'Overlay mesh networking', repo: 'fedora' },
      { id: 'openconnect', name: 'OpenConnect', description: 'SSL VPN client', repo: 'community' },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud Agents',
    extensions: [
      { id: 'qemu-guest-agent', name: 'QEMU Guest Agent', description: 'Guest-host communication for QEMU/KVM', repo: 'fedora' },
      { id: 'WALinuxAgent', name: 'Azure Linux Agent', description: 'Azure VM provisioning agent', repo: 'fedora' },
      { id: 'amazon-ec2-utils', name: 'EC2 Utils', description: 'Amazon EC2 instance utilities', repo: 'fedora' },
      { id: 'google-guest-agent', name: 'Google Guest Agent', description: 'GCE instance management', repo: 'fedora' },
    ],
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    extensions: [
      { id: 'libvirtd', name: 'libvirtd', description: 'Virtualization management daemon', repo: 'fedora' },
      { id: 'libvirtd-desktop', name: 'libvirtd (Desktop)', description: 'libvirtd with virt-manager GUI', repo: 'fedora' },
      { id: 'cloud-hypervisor', name: 'Cloud Hypervisor', description: 'Minimal VMM for cloud workloads', repo: 'community' },
    ],
  },
]
