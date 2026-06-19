import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { timezones } from '../../data/timezones'

export default function ConfigStep() {
  const { state, dispatch } = useWizard()
  const [portInput, setPortInput] = useState('')
  const [fwServiceInput, setFwServiceInput] = useState('')

  function update(field, value) {
    dispatch({ type: 'UPDATE_FIELD', field, value })
  }

  function addPort(e) {
    e.preventDefault()
    if (!portInput) return
    const port = portInput.includes('/') ? portInput : `${portInput}/tcp`
    dispatch({ type: 'ADD_FIREWALL_PORT', payload: port })
    setPortInput('')
  }

  function addFwService(e) {
    e.preventDefault()
    if (!fwServiceInput) return
    dispatch({ type: 'ADD_FIREWALL_SERVICE', payload: fwServiceInput })
    setFwServiceInput('')
  }

  return (
    <div className="step">
      <h2>System Configuration</h2>
      <p className="step-description">
        Set timezone, locale, and firewall rules.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={state.timezone}
            onChange={e => update('timezone', e.target.value)}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="locale">Locale</label>
          <select
            id="locale"
            value={state.locale}
            onChange={e => update('locale', e.target.value)}
          >
            <option value="en_US.UTF-8">en_US.UTF-8</option>
            <option value="en_GB.UTF-8">en_GB.UTF-8</option>
            <option value="de_DE.UTF-8">de_DE.UTF-8</option>
            <option value="fr_FR.UTF-8">fr_FR.UTF-8</option>
            <option value="es_ES.UTF-8">es_ES.UTF-8</option>
            <option value="it_IT.UTF-8">it_IT.UTF-8</option>
            <option value="pt_BR.UTF-8">pt_BR.UTF-8</option>
            <option value="ja_JP.UTF-8">ja_JP.UTF-8</option>
            <option value="ko_KR.UTF-8">ko_KR.UTF-8</option>
            <option value="zh_CN.UTF-8">zh_CN.UTF-8</option>
            <option value="ru_RU.UTF-8">ru_RU.UTF-8</option>
            <option value="pl_PL.UTF-8">pl_PL.UTF-8</option>
            <option value="cs_CZ.UTF-8">cs_CZ.UTF-8</option>
            <option value="sk_SK.UTF-8">sk_SK.UTF-8</option>
          </select>
        </div>
      </div>

      {state.enabledServices.length > 0 && (
        <div className="form-group">
          <label>Enabled services</label>
          <div className="package-tags">
            {state.enabledServices.map(svc => (
              <span key={svc} className="tag">
                {svc}
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'TOGGLE_SERVICE', payload: svc })}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Firewall</label>
        {(state.firewall.services.length > 0 || state.firewall.ports.length > 0) && (
          <div className="package-tags">
            {state.firewall.services.map(s => (
              <span key={s} className="tag firewall-tag">
                {s}
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'REMOVE_FIREWALL_SERVICE', payload: s })}
                >
                  x
                </button>
              </span>
            ))}
            {state.firewall.ports.map(p => (
              <span key={p} className="tag firewall-tag">
                {p}
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'REMOVE_FIREWALL_PORT', payload: p })}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="form-row">
          <form onSubmit={addFwService} className="inline-form">
            <input
              type="text"
              placeholder="Service (http, ssh...)"
              value={fwServiceInput}
              onChange={e => setFwServiceInput(e.target.value)}
            />
            <button type="submit" className="btn-small">Add</button>
          </form>
          <form onSubmit={addPort} className="inline-form">
            <input
              type="text"
              placeholder="Port (8080/tcp)"
              value={portInput}
              onChange={e => setPortInput(e.target.value)}
            />
            <button type="submit" className="btn-small">Add</button>
          </form>
        </div>
      </div>
    </div>
  )
}
