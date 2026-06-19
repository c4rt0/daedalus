import { useWizard } from '../../hooks/useWizardState'

const purposes = [
  { value: '', label: 'None' },
  { value: 'Server', label: 'Server' },
  { value: 'Desktop', label: 'Desktop' },
  { value: 'Kiosk', label: 'Kiosk' },
  { value: 'Edge Device', label: 'Edge Device' },
  { value: 'Dev Workstation', label: 'Dev Workstation' },
  { value: 'CI Runner', label: 'CI Runner' },
]

export default function IdentityStep() {
  const { state, dispatch } = useWizard()

  function update(field, value) {
    dispatch({ type: 'UPDATE_FIELD', field, value })
  }

  return (
    <div className="step">
      <h2>System Identity</h2>
      <p className="step-description">
        Give your OS a name and hostname.
      </p>

      <div className="form-group">
        <label htmlFor="os-name">OS Name</label>
        <input
          id="os-name"
          type="text"
          placeholder="My Custom OS"
          value={state.osName}
          onChange={e => update('osName', e.target.value)}
        />
        <span className="form-hint">
          Shown in PRETTY_NAME in /etc/os-release
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="hostname">Hostname</label>
        <input
          id="hostname"
          type="text"
          placeholder="homelab"
          value={state.hostname}
          onChange={e => update('hostname', e.target.value)}
        />
        <span className="form-hint">
          Written to /etc/hostname. If left empty, the system defaults
          to "localhost" or whatever DHCP/cloud-init assigns.
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="purpose">Purpose</label>
        <div className="purpose-chips">
          {purposes.map(p => (
            <button
              key={p.value}
              className={`chip ${state.purpose === p.value ? 'selected' : ''}`}
              onClick={() => update('purpose', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
