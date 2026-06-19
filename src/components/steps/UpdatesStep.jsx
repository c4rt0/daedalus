import { useWizard } from '../../hooks/useWizardState'

export default function UpdatesStep() {
  const { state, dispatch } = useWizard()

  function update(field, value) {
    dispatch({ type: 'UPDATE_FIELD', field, value })
  }

  return (
    <div className="step">
      <h2>Auto-Updates</h2>
      <p className="step-description">
        When you push a new version of your container image to a registry,
        the system can automatically pull and apply it. Updates are staged
        and applied on reboot.
      </p>

      <div className="form-group">
        <label>Update strategy</label>
        <div className="strategy-cards">
          <button
            className={`image-card ${state.updateStrategy === 'enabled' ? 'selected' : ''}`}
            onClick={() => update('updateStrategy', 'enabled')}
          >
            <strong>Automatic</strong>
            <span className="image-description">
              Periodically check for new image versions and apply them.
              Default: check 1h after boot, then every 8h.
            </span>
          </button>

          <button
            className={`image-card ${state.updateStrategy === 'custom' ? 'selected' : ''}`}
            onClick={() => update('updateStrategy', 'custom')}
          >
            <strong>Custom schedule</strong>
            <span className="image-description">
              Automatic updates with a custom check interval.
            </span>
          </button>

          <button
            className={`image-card ${state.updateStrategy === 'disabled' ? 'selected' : ''}`}
            onClick={() => update('updateStrategy', 'disabled')}
          >
            <strong>Manual</strong>
            <span className="image-description">
              No automatic updates. Run <code>bootc upgrade --apply</code> when
              you're ready.
            </span>
          </button>
        </div>
      </div>

      {state.updateStrategy === 'custom' && (
        <div className="form-row">
          <div className="form-group">
            <label>First check after boot</label>
            <select
              value={state.updateOnBootSec || '1h'}
              onChange={e => update('updateOnBootSec', e.target.value)}
            >
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h">2 hours</option>
            </select>
          </div>
          <div className="form-group">
            <label>Check interval</label>
            <select
              value={state.updateInterval || '8h'}
              onChange={e => update('updateInterval', e.target.value)}
            >
              <option value="1h">Every hour</option>
              <option value="4h">Every 4 hours</option>
              <option value="8h">Every 8 hours</option>
              <option value="12h">Every 12 hours</option>
              <option value="24h">Every 24 hours</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
