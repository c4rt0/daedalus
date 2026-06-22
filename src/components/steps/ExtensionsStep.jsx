import { useWizard } from '../../hooks/useWizardState'
import { extensionCategories } from '../../data/extensions'

export default function ExtensionsStep() {
  const { state, dispatch } = useWizard()

  const isFedora = state.baseImage.includes('fedora') || !state.baseImage

  function toggleExtension(extId) {
    if (state.extensions.includes(extId)) {
      dispatch({ type: 'REMOVE_EXTENSION', payload: extId })
    } else {
      dispatch({ type: 'ADD_EXTENSION', payload: extId })
    }
  }

  return (
    <div className="step">
      <h2>Extensions</h2>
      <p className="step-description">
        System extensions overlay binaries onto <code>/usr</code> at runtime
        without modifying the base image. They download on first boot and
        auto-update independently.
      </p>

      {!isFedora && (
        <div className="warning-banner">
          <strong>Fedora only.</strong> The extension catalog is built for
          Fedora base images. Extensions may not work with CentOS Stream
          or custom images.
        </div>
      )}

      {extensionCategories.map(cat => (
        <div key={cat.id} className="extension-category">
          <h3>{cat.name}</h3>
          <div className="extensions-grid">
            {cat.extensions.map(ext => {
              const active = state.extensions.includes(ext.id)
              return (
                <button
                  key={ext.id}
                  className={`extension-card ${active ? 'selected' : ''}`}
                  onClick={() => toggleExtension(ext.id)}
                >
                  <strong>{ext.name}</strong>
                  <span className="extension-description">{ext.description}</span>
                  {ext.repo === 'community' && (
                    <span className="extension-badge">community</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {state.extensions.length > 0 && (
        <div className="form-group">
          <label>Selected extensions</label>
          <div className="package-tags">
            {state.extensions.map(ext => (
              <span key={ext} className="tag">
                {ext}
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'REMOVE_EXTENSION', payload: ext })}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="custom-extensions">Custom extensions</label>
        <input
          id="custom-extensions"
          type="text"
          placeholder="space or comma separated: my-sysext another-ext"
          value={state.customExtensions}
          onChange={e => dispatch({
            type: 'UPDATE_FIELD',
            field: 'customExtensions',
            value: e.target.value,
          })}
        />
        <span className="form-hint">
          Names must match extensions on{' '}
          <a href="https://fedora-sysexts.github.io/" target="_blank" rel="noreferrer">
            extensions.fcos.fr
          </a>
        </span>
      </div>

      {(state.extensions.length > 0 || state.customExtensions.trim()) && (
        <div className="info-banner">
          Extensions download on first boot. The system needs network access.
        </div>
      )}

      <div className="extension-sources">
        <h3>Sources</h3>
        <ul>
          <li><a href="https://extensions.fcos.fr/fedora" target="_blank" rel="noreferrer">extensions.fcos.fr/fedora</a> — official Fedora sysexts</li>
          <li><a href="https://extensions.fcos.fr/community" target="_blank" rel="noreferrer">extensions.fcos.fr/community</a> — community sysexts</li>
          <li><a href="https://github.com/fedora-sysexts" target="_blank" rel="noreferrer">github.com/fedora-sysexts</a> — source repos and build configs</li>
        </ul>
      </div>
    </div>
  )
}
