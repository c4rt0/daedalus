export function generateBuildScript(config) {
  const tag = config.hostname || 'my-os'
  const hasSshKeys = !!(config.sshKeys?.trim())

  const sections = [
    header(tag),
    colorHelpers(),
    prerequisites(),
    buildImage(tag),
    formatSelection(),
    diskImageQcow2(tag, hasSshKeys),
    diskImageOther(tag),
    doneSection(hasSshKeys),
  ]

  return sections.filter(Boolean).join('\n\n') + '\n'
}

function header(tag) {
  return `#!/bin/bash
set -euo pipefail

IMAGE_TAG="${tag}"`
}

function colorHelpers() {
  return `info()    { printf '\\033[0;36m>> %s\\033[0m\\n' "$*"; }
success() { printf '\\033[0;32m>> %s\\033[0m\\n' "$*"; }
error()   { printf '\\033[0;31m>> %s\\033[0m\\n' "$*" >&2; }`
}

function prerequisites() {
  return `info "Checking prerequisites..."

if ! command -v podman &>/dev/null; then
  error "podman is not installed. Install it with: sudo dnf install podman"
  exit 1
fi`
}

function buildImage(tag) {
  return `info "Building container image '$IMAGE_TAG'..."
sudo podman build --net=host -t "$IMAGE_TAG" .
success "Image '$IMAGE_TAG' built successfully"`
}

function formatSelection() {
  return `echo ""
info "What disk format do you want to generate?"
echo ""
PS3="Pick a number: "
select FORMAT in \\
  "qcow2    — VM image (QEMU, libvirt, Proxmox)" \\
  "iso      — Installable ISO (bare metal, USB)" \\
  "ami      — AWS AMI" \\
  "vmdk     — VMware" \\
  "vhd      — Azure / Hyper-V" \\
  "gce      — Google Cloud" \\
  "Skip     — I'll deploy differently"
do
  case "$REPLY" in
    1) DISK_TYPE="qcow2"; break;;
    2) DISK_TYPE="anaconda-iso"; break;;
    3) DISK_TYPE="ami"; break;;
    4) DISK_TYPE="vmdk"; break;;
    5) DISK_TYPE="vhd"; break;;
    6) DISK_TYPE="gce"; break;;
    7) success "Skipping disk image generation. Your container image is ready as '$IMAGE_TAG'."
       exit 0;;
    *) echo "Invalid choice, try again.";;
  esac
done`
}

function diskImageQcow2(tag, hasSshKeys) {
  let sshSetup = ''
  let sshArg = ''
  if (hasSshKeys) {
    sshSetup = `
  # Find an SSH private key and derive the public key for bootc
  SSH_ARG=""
  for key in id_ed25519_* id_rsa_*; do
    if [ -f "$key" ] && [ "\${key%.pub}" = "$key" ]; then
      if [ ! -f "\${key}.pub" ]; then
        ssh-keygen -y -f "$key" > "\${key}.pub"
      fi
      cp "\${key}.pub" ./output/qcow2/key.pub
      SSH_ARG="--root-ssh-authorized-keys /output/qcow2/key.pub"
      break
    fi
  done
`
    sshArg = '    $SSH_ARG \\\n'
  }

  return `if [ "$DISK_TYPE" = "qcow2" ]; then
  info "Generating qcow2 disk image..."
  mkdir -p ./output/qcow2
  DISK_RAW="./output/qcow2/disk.raw"
  truncate -s 10G "$DISK_RAW"
${sshSetup}
  sudo podman run --rm --privileged --pid=host \\
    --security-opt label=type:unconfined_t \\
    -v /var/lib/containers/storage:/var/lib/containers/storage \\
    -v ./output:/output \\
    "localhost/$IMAGE_TAG" \\
    bootc install to-disk --via-loopback \\
      --wipe \\
      --filesystem xfs \\
      --generic-image \\
      --skip-fetch-check \\
      --karg console=ttyS0,115200n8 \\
${sshArg}      /output/qcow2/disk.raw

  info "Converting to qcow2..."
  qemu-img convert -f raw -O qcow2 "$DISK_RAW" ./output/qcow2/disk.qcow2
  rm -f "$DISK_RAW"
  sudo chown -R "$(id -u):$(id -g)" ./output
fi`
}

function diskImageOther(tag) {
  return `if [ "$DISK_TYPE" != "qcow2" ]; then
  info "Generating $DISK_TYPE disk image..."
  mkdir -p ./output

  sudo podman run --rm -it --privileged --net=host \\
    -v /var/lib/containers/storage:/var/lib/containers/storage \\
    -v ./output:/output \\
    quay.io/centos-bootc/bootc-image-builder:latest \\
    --rootfs xfs --type "$DISK_TYPE" \\
    "localhost/$IMAGE_TAG"

  sudo chown -R "$(id -u):$(id -g)" ./output
fi`
}

function doneSection(hasSshKeys) {
  const sshKeyFlag = hasSshKeys
    ? `
    SSH_KEY=""
    for key in id_ed25519_* id_rsa_*; do
      if [ -f "$key" ] && [ "\${key%.pub}" = "$key" ]; then
        SSH_KEY="-i ./$key"
        break
      fi
    done`
    : ''

  const sshCmd = hasSshKeys ? '$SSH_KEY ' : ''

  return `echo ""
case "$DISK_TYPE" in
  qcow2)
    success "Done! Image at ./output/qcow2/disk.qcow2"
    echo ""
    info "To boot and connect:"${sshKeyFlag}
    echo ""
    echo "  qemu-system-x86_64 -m 2048 -cpu host -enable-kvm -nographic \\\\"
    echo "    -drive if=virtio,file=./output/qcow2/disk.qcow2 \\\\"
    echo "    -nic user,model=virtio,hostfwd=tcp::2222-:22"
    echo ""
    echo "  ssh -p 2222 ${sshCmd}root@localhost"
    ;;
  anaconda-iso)
    success "Done! ISO at ./output/bootiso/install.iso"
    echo ""
    info "Write to USB:"
    echo "  sudo dd if=./output/bootiso/install.iso of=/dev/sdX bs=4M status=progress"
    echo "  (replace /dev/sdX with your USB device — check with lsblk)"
    ;;
  ami)
    success "Done! AMI at ./output/image/disk.raw"
    echo ""
    info "Upload to AWS with the EC2 import-image API or console."
    ;;
  vmdk)
    success "Done! VMDK at ./output/vmdk/disk.vmdk"
    echo ""
    info "Import into VMware vSphere or Workstation."
    ;;
  vhd)
    success "Done! VHD at ./output/vpc/disk.vhd"
    echo ""
    info "Upload to Azure or import into Hyper-V."
    ;;
  gce)
    success "Done! GCE image at ./output/gce/disk.tar.gz"
    echo ""
    info "Upload to Google Cloud with: gcloud compute images import"
    ;;
esac`
}
