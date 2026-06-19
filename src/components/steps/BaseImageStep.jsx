import { useWizard } from '../../hooks/useWizardState'
import { baseImages } from '../../data/baseImages'

export default function BaseImageStep() {
  const { state, dispatch } = useWizard()

  const selected = baseImages.find(img => img.url === state.baseImage) ||
    baseImages.find(img => img.id === 'custom')

  function selectImage(img) {
    if (img.id === 'custom') {
      dispatch({ type: 'UPDATE_FIELD', field: 'baseImage', value: '' })
    } else {
      dispatch({ type: 'UPDATE_FIELD', field: 'baseImage', value: img.url })
      dispatch({ type: 'UPDATE_FIELD', field: 'customBaseImage', value: '' })
    }
  }

  return (
    <div className="step">
      <h2>Base Image</h2>
      <p className="step-description">
        Choose the foundation OS for your image. This determines the
        package manager, available packages, and update cadence.
      </p>

      <div className="image-grid">
        {baseImages.map(img => (
          <button
            key={img.id}
            className={`image-card ${selected?.id === img.id ? 'selected' : ''}`}
            onClick={() => selectImage(img)}
          >
            <strong>{img.name}</strong>
            <span className="image-description">{img.description}</span>
            {img.url && <code className="image-url">{img.url}</code>}
          </button>
        ))}
      </div>

      {selected?.id === 'fedora-rawhide' && (
        <div className="warning-banner">
          <strong>Rawhide is unstable.</strong> Packages break frequently
          during major transitions (Python, GCC). Some package presets
          may fail to install. Use Fedora 44 for reliable builds.
        </div>
      )}

      {selected?.id === 'custom' && (
        <div className="form-group">
          <label htmlFor="custom-image">Container image URL</label>
          <input
            id="custom-image"
            type="text"
            placeholder="quay.io/org/image:tag"
            value={state.customBaseImage}
            onChange={e => dispatch({
              type: 'UPDATE_FIELD',
              field: 'customBaseImage',
              value: e.target.value,
            })}
          />
        </div>
      )}
    </div>
  )
}
