export async function generateSshKeyPair(comment = 'bootc-wizard') {
  const keyPair = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify'])

  const publicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))
  const publicKeyStr = formatOpenSshPublicKey(publicKeyRaw, comment)

  const privateKeyPkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey))
  const ed25519Seed = privateKeyPkcs8.slice(16, 48)
  const privateKeyPem = formatOpenSshPrivateKey(ed25519Seed, publicKeyRaw, comment)

  return { publicKey: publicKeyStr, privateKeyPem }
}

function formatOpenSshPublicKey(rawPublicKey, comment) {
  const keyType = new TextEncoder().encode('ssh-ed25519')

  const buf = new Uint8Array(4 + keyType.length + 4 + rawPublicKey.length)
  const view = new DataView(buf.buffer)

  let offset = 0
  view.setUint32(offset, keyType.length)
  offset += 4
  buf.set(keyType, offset)
  offset += keyType.length
  view.setUint32(offset, rawPublicKey.length)
  offset += 4
  buf.set(rawPublicKey, offset)

  const b64 = btoa(String.fromCharCode(...buf))
  return `ssh-ed25519 ${b64} ${comment}`
}

function formatOpenSshPrivateKey(seed, pubRaw, comment) {
  const keyType = new TextEncoder().encode('ssh-ed25519')
  const commentBytes = new TextEncoder().encode(comment)
  const authMagic = new TextEncoder().encode('openssh-key-v1\0')
  const none = new TextEncoder().encode('none')

  const checkInt = crypto.getRandomValues(new Uint32Array(1))[0]

  const privSection = buildBuffer([
    uint32(checkInt), uint32(checkInt),
    sshString(keyType),
    sshString(pubRaw),
    uint32(64), seed, pubRaw,
    sshString(commentBytes),
  ])

  const padded = padTo8(privSection)

  const outer = buildBuffer([
    authMagic,
    sshString(none), sshString(none), sshString(new Uint8Array(0)),
    uint32(1),
    sshString(buildBuffer([sshString(keyType), sshString(pubRaw)])),
    sshString(padded),
  ])

  const b64 = btoa(String.fromCharCode(...outer))
  const lines = b64.match(/.{1,70}/g) || []
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines.join('\n')}\n-----END OPENSSH PRIVATE KEY-----\n`
}

function buildBuffer(parts) {
  const totalLen = parts.reduce((s, p) => s + p.length, 0)
  const buf = new Uint8Array(totalLen)
  let off = 0
  for (const p of parts) { buf.set(p, off); off += p.length }
  return buf
}

function uint32(val) {
  const buf = new Uint8Array(4)
  new DataView(buf.buffer).setUint32(0, val)
  return buf
}

function sshString(data) {
  if (typeof data === 'string') data = new TextEncoder().encode(data)
  return buildBuffer([uint32(data.length), data])
}

function padTo8(buf) {
  const padLen = (8 - (buf.length % 8)) % 8
  if (padLen === 0) return buf
  const pad = new Uint8Array(padLen)
  for (let i = 0; i < padLen; i++) pad[i] = i + 1
  return buildBuffer([buf, pad])
}

export function downloadPrivateKey(pem, filename = 'id_ed25519') {
  const blob = new Blob([pem], { type: 'application/x-pem-file' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
