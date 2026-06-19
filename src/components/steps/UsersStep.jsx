import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { generateSshKeyPair, downloadPrivateKey } from '../../utils/sshKeygen'

export default function UsersStep() {
  const { state, dispatch } = useWizard()
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)

  function updateUser(index, field, value) {
    dispatch({ type: 'UPDATE_USER', index, field, value })
  }

  async function handleGenerateKey(userIndex) {
    setGenerating(true)
    try {
      const username = state.users[userIndex].name || 'user'
      const pair = await generateSshKeyPair(`${username}@bootc-wizard`)

      const existing = state.users[userIndex].sshKeys
      const newKeys = existing
        ? `${existing}\n${pair.publicKey}`
        : pair.publicKey
      updateUser(userIndex, 'sshKeys', newKeys)

      setGenerated({ userIndex, pem: pair.pem })
      downloadPrivateKey(pair.privateKeyPem, `id_ed25519_${username}`)
    } catch (err) {
      alert(`Key generation failed: ${err.message}\n\nYour browser may not support Ed25519. Generate a key manually:\n  ssh-keygen -t ed25519`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="step">
      <h2>Users</h2>
      <p className="step-description">
        FCOS provisions users at first boot via Ignition. The default
        user is <code>core</code>. Add SSH keys here for access — password
        login is disabled by default.
      </p>

      {state.users.map((user, i) => (
        <div key={i} className="user-card">
          <div className="user-card-header">
            <h3>{user.name || `User ${i + 1}`}</h3>
            {i > 0 && (
              <button
                className="btn-small"
                onClick={() => dispatch({ type: 'REMOVE_USER', index: i })}
              >
                Remove
              </button>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="core"
                value={user.name}
                onChange={e => updateUser(i, 'name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Shell</label>
              <select
                value={user.shell}
                onChange={e => updateUser(i, 'shell', e.target.value)}
              >
                <option value="/bin/bash">/bin/bash</option>
                <option value="/bin/zsh">/bin/zsh</option>
                <option value="/sbin/nologin">/sbin/nologin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>SSH Authorized Keys</label>
            <textarea
              rows={3}
              placeholder="ssh-ed25519 AAAA... user@host"
              value={user.sshKeys}
              onChange={e => updateUser(i, 'sshKeys', e.target.value)}
              className="mono"
            />
            <div className="ssh-key-actions">
              <button
                className="btn btn-secondary btn-generate"
                onClick={() => handleGenerateKey(i)}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate ed25519 key pair'}
              </button>
              <span className="form-hint ssh-warning">
                The private key will download automatically.
                Save it to <code>~/.ssh/</code> and <code>chmod 600</code> it.
                It cannot be recovered — if you lose it, generate a new one.
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Password Hash (optional)</label>
            <input
              type="text"
              placeholder="Generate with: mkpasswd -m yescrypt"
              value={user.passwordHash}
              onChange={e => updateUser(i, 'passwordHash', e.target.value)}
            />
            <span className="form-hint">
              Leave empty for SSH-only access (recommended)
            </span>
          </div>

          <div className="form-group">
            <label>Groups</label>
            <input
              type="text"
              placeholder="sudo, wheel, docker"
              value={(user.groups || []).join(', ')}
              onChange={e => updateUser(i, 'groups',
                e.target.value.split(',').map(g => g.trim()).filter(Boolean)
              )}
            />
          </div>
        </div>
      ))}

      <button
        className="btn btn-secondary"
        onClick={() => dispatch({ type: 'ADD_USER' })}
      >
        + Add user
      </button>
    </div>
  )
}
