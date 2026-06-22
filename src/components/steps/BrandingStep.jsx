import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'

const LOGO_MAX_SIZE = 256

export default function BrandingStep() {
  const { state, dispatch } = useWizard()
  const [originalSize, setOriginalSize] = useState(null)

  function update(field, value) {
    dispatch({ type: 'UPDATE_FIELD', field, value })
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      setOriginalSize({ w: img.width, h: img.height })

      if (img.width <= LOGO_MAX_SIZE && img.height <= LOGO_MAX_SIZE) {
        const reader = new FileReader()
        reader.onload = () => update('logo', reader.result)
        reader.readAsDataURL(file)
        return
      }

      const scale = Math.min(LOGO_MAX_SIZE / img.width, LOGO_MAX_SIZE / img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      update('logo', canvas.toDataURL('image/png'))
    }
    img.src = URL.createObjectURL(file)
  }

  const logoMode = state.logoMode || 'none'

  function setLogoMode(mode) {
    update('logoMode', mode)
    if (mode !== 'image') {
      update('logo', null)
      setOriginalSize(null)
    }
    if (mode !== 'text') {
      update('logoText', '')
    }
  }

  return (
    <div className="step">
      <h2>Branding</h2>
      <p className="step-description">
        Customize the login experience. The MOTD banner is shown
        when users log in via SSH or console.
      </p>

      <div className="form-group">
        <label htmlFor="motd">MOTD Banner</label>
        <textarea
          id="motd"
          rows={8}
          placeholder={`  Welcome to My OS\n  ─────────────────\n  Built with Daedalus`}
          value={state.motd}
          onChange={e => update('motd', e.target.value)}
          className="mono"
        />
        <span className="form-hint">
          Text or ASCII art written to /etc/motd.d/banner.motd
        </span>
      </div>

      <div className="form-group">
        <label>System Logo (optional)</label>
        <div className="purpose-chips">
          <button
            className={`chip ${logoMode === 'none' ? 'selected' : ''}`}
            onClick={() => setLogoMode('none')}
          >
            None
          </button>
          <button
            className={`chip ${logoMode === 'text' ? 'selected' : ''}`}
            onClick={() => setLogoMode('text')}
          >
            ASCII / Text
          </button>
          <button
            className={`chip ${logoMode === 'image' ? 'selected' : ''}`}
            onClick={() => setLogoMode('image')}
          >
            Image
          </button>
        </div>
      </div>

      {logoMode === 'text' && (
        <div className="form-group">
          <label htmlFor="logo-text">ASCII Logo</label>
          <textarea
            id="logo-text"
            rows={8}
            className="mono"
            placeholder={` ______   _______  _______  ______   _______  ___      __   __  _______ \n|      | |   _   ||       ||      | |   _   ||   |    |  | |  ||       |\n|  _    ||  |_|  ||    ___||  _    ||  |_|  ||   |    |  | |  ||  _____|\n| | |   ||       ||   |___ | | |   ||       ||   |    |  |_|  || |_____ \n| |_|   ||       ||    ___|| |_|   ||       ||   |___ |       ||_____  |\n|       ||   _   ||   |___ |       ||   _   ||       ||       | _____| |\n|______| |__| |__||_______||______| |__| |__||_______||_______||_______|`}
            value={state.logoText || ''}
            onChange={e => update('logoText', e.target.value)}
          />
          <span className="form-hint">
            Written to /etc/issue.d/logo.issue (shown on console login screen).
            Use a{' '}
            <a href="https://patorjk.com/software/taag/" target="_blank" rel="noopener">
              text art generator
            </a>
            {' '}to create one from your OS name.
          </span>
        </div>
      )}

      {logoMode === 'image' && (
        <div className="form-group">
          <input
            id="logo"
            type="file"
            accept="image/png,image/svg+xml"
            onChange={handleLogoUpload}
          />
          <span className="form-hint">
            PNG or SVG, max 256x256px (larger images are resized automatically).
            Used by Plymouth (boot splash) and GDM (login screen).
            Saved to /usr/share/pixmaps/system-logo-white.png
          </span>
          {state.logo && (
            <div className="logo-preview">
              <img src={state.logo} alt="System logo preview" />
              <div className="logo-info">
                {originalSize && (originalSize.w > LOGO_MAX_SIZE || originalSize.h > LOGO_MAX_SIZE) ? (
                  <span className="form-hint">
                    Resized from {originalSize.w}x{originalSize.h} to fit {LOGO_MAX_SIZE}x{LOGO_MAX_SIZE}
                  </span>
                ) : originalSize ? (
                  <span className="form-hint">
                    {originalSize.w}x{originalSize.h}px
                  </span>
                ) : null}
                <button
                  className="btn-small"
                  onClick={() => { update('logo', null); setOriginalSize(null) }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
