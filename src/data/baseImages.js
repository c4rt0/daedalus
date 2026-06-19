export const baseImages = [
  {
    id: 'fedora-44',
    name: 'Fedora 44',
    url: 'quay.io/fedora/fedora-bootc:44',
    description: 'Latest stable Fedora',
  },
  {
    id: 'fedora-rawhide',
    name: 'Fedora Rawhide',
    url: 'quay.io/fedora/fedora-bootc:rawhide',
    description: 'Bleeding edge, may break',
  },
  {
    id: 'centos-stream-10',
    name: 'CentOS Stream 10',
    url: 'quay.io/centos-bootc/centos-bootc:stream10',
    description: 'Enterprise-adjacent, stable',
  },
  {
    id: 'centos-stream-9',
    name: 'CentOS Stream 9',
    url: 'quay.io/centos-bootc/centos-bootc:stream9',
    description: 'Older enterprise stream',
  },
  {
    id: 'custom',
    name: 'Custom',
    url: '',
    description: 'Enter your own base image URL',
  },
]
