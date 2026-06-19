import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { packagePresets } from '../../data/packagePresets'

export default function PackagesStep() {
  const { state, dispatch } = useWizard()
  const [repoName, setRepoName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [repoGpg, setRepoGpg] = useState('')

  function togglePreset(preset) {
    const allIncluded = preset.packages.every(p => state.packages.includes(p))
    if (allIncluded) {
      dispatch({ type: 'REMOVE_PACKAGES', payload: preset.packages })
      for (const svc of preset.services) {
        if (state.enabledServices.includes(svc)) {
          dispatch({ type: 'TOGGLE_SERVICE', payload: svc })
        }
      }
      for (const fw of preset.firewall) {
        if (fw.includes('/')) {
          dispatch({ type: 'REMOVE_FIREWALL_PORT', payload: fw })
        } else {
          dispatch({ type: 'REMOVE_FIREWALL_SERVICE', payload: fw })
        }
      }
      for (const unit of (preset.systemdUnits || [])) {
        const idx = state.systemdUnits.findIndex(u => u.name === unit.name)
        if (idx !== -1) {
          dispatch({ type: 'REMOVE_SYSTEMD_UNIT', index: idx })
        }
      }
    } else {
      dispatch({ type: 'ADD_PACKAGES', payload: preset.packages })
      for (const svc of preset.services) {
        if (!state.enabledServices.includes(svc)) {
          dispatch({ type: 'TOGGLE_SERVICE', payload: svc })
        }
      }
      for (const fw of preset.firewall) {
        if (fw.includes('/')) {
          dispatch({ type: 'ADD_FIREWALL_PORT', payload: fw })
        } else {
          dispatch({ type: 'ADD_FIREWALL_SERVICE', payload: fw })
        }
      }
      for (const unit of (preset.systemdUnits || [])) {
        if (!state.systemdUnits.some(u => u.name === unit.name)) {
          dispatch({ type: 'ADD_SYSTEMD_UNIT', payload: unit })
        }
      }
    }
  }

  function addRepo(e) {
    e.preventDefault()
    if (!repoName || !repoUrl) return
    dispatch({ type: 'ADD_REPO', payload: { name: repoName, url: repoUrl, gpgKey: repoGpg } })
    setRepoName('')
    setRepoUrl('')
    setRepoGpg('')
  }

  return (
    <div className="step">
      <h2>Packages</h2>
      <p className="step-description">
        Pick a preset or add individual packages. Presets also
        configure services, firewall rules, and systemd units.
      </p>

      <div className="presets-grid">
        {packagePresets.map(preset => {
          const active = preset.packages.every(p => state.packages.includes(p))
          return (
            <button
              key={preset.id}
              className={`preset-card ${active ? 'selected' : ''}`}
              onClick={() => togglePreset(preset)}
            >
              <span className="preset-icon">{preset.icon}</span>
              <strong>{preset.name}</strong>
              <span className="preset-packages">
                {preset.packages.join(', ')}
              </span>
            </button>
          )
        })}
      </div>

      {state.packages.length > 0 && (
        <div className="form-group">
          <label>Selected packages</label>
          <div className="package-tags">
            {state.packages.map(pkg => (
              <span key={pkg} className="tag">
                {pkg}
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'REMOVE_PACKAGE', payload: pkg })}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="custom-packages">Additional packages</label>
        <input
          id="custom-packages"
          type="text"
          placeholder="space or comma separated: strace tcpdump nmap"
          value={state.customPackages}
          onChange={e => dispatch({
            type: 'UPDATE_FIELD',
            field: 'customPackages',
            value: e.target.value,
          })}
        />
      </div>

      <details className="repo-section">
        <summary>Custom repositories</summary>
        <form onSubmit={addRepo} className="repo-form">
          <input
            type="text"
            placeholder="Repo name"
            value={repoName}
            onChange={e => setRepoName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Base URL"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="GPG key URL (optional)"
            value={repoGpg}
            onChange={e => setRepoGpg(e.target.value)}
          />
          <button type="submit" className="btn-small">Add repo</button>
        </form>
        {state.customRepos.map((repo, i) => (
          <div key={i} className="repo-entry">
            <strong>{repo.name}</strong> — <code>{repo.url}</code>
            <button
              className="tag-remove"
              onClick={() => dispatch({ type: 'REMOVE_REPO', payload: i })}
            >
              x
            </button>
          </div>
        ))}
      </details>
    </div>
  )
}
