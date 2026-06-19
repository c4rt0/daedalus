import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'

const UNIT_TEMPLATES = [
  {
    id: 'container',
    name: 'Container (Quadlet)',
    description: 'Run a container as a systemd service. Quadlet replaces docker-compose on FCOS — systemd manages the container lifecycle (start, stop, restart, logs).',
    template: `[Unit]
Description=My Container
After=network-online.target
Wants=network-online.target

[Container]
Image=docker.io/library/nginx:latest
PublishPort=8080:80

[Install]
WantedBy=multi-user.target`,
    filename: 'my-container.container',
    hint: 'Change Image= and PublishPort= to match your container. File must end in .container',
  },
  {
    id: 'oneshot',
    name: 'One-shot script',
    description: 'Run a script once at boot (e.g. first-boot setup, provisioning). The service stays "active" after finishing so systemd knows it completed.',
    template: `[Unit]
Description=Run setup script on boot

[Service]
Type=oneshot
ExecStart=/usr/local/bin/setup.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target`,
    filename: 'setup.service',
    hint: 'Put your script in the Storage step or bake it into the Containerfile',
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Run something on a schedule (like cron, but managed by systemd). Needs a matching .service file with the same name.',
    template: `[Unit]
Description=Run backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target`,
    filename: 'backup.timer',
    hint: 'OnCalendar= accepts: daily, hourly, weekly, *-*-* 03:00 (3am), etc.',
  },
  {
    id: 'custom',
    name: 'Custom unit',
    description: 'Write a unit file from scratch.',
    template: '',
    filename: '',
    hint: null,
  },
]

export default function SystemdStep() {
  const { state, dispatch } = useWizard()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [unitName, setUnitName] = useState('')
  const [unitContents, setUnitContents] = useState('')

  function addUnit(e) {
    e.preventDefault()
    if (!unitName) return
    dispatch({
      type: 'ADD_SYSTEMD_UNIT',
      payload: { name: unitName, enabled: true, contents: unitContents },
    })
    setUnitName('')
    setUnitContents('')
    setSelectedTemplate('')
  }

  function applyTemplate(id) {
    const tpl = UNIT_TEMPLATES.find(t => t.id === id)
    if (!tpl) return
    setSelectedTemplate(id)
    if (tpl.filename) setUnitName(tpl.filename)
    if (tpl.template) setUnitContents(tpl.template)
  }

  return (
    <div className="step">
      <h2>Systemd Units</h2>
      <p className="step-description">
        Systemd units define services, timers, and containers that run
        on your OS. Ignition writes them at first boot. Pick a template
        below to get started — each one is a working example you can
        customize.
      </p>

      {state.systemdUnits.length > 0 && (
        <div className="units-list">
          {state.systemdUnits.map((unit, i) => (
            <div key={i} className="unit-card">
              <div className="unit-card-header">
                <code>{unit.name}</code>
                <span className={`unit-badge ${unit.enabled ? 'enabled' : ''}`}>
                  {unit.enabled ? 'enabled' : 'disabled'}
                </span>
                <button
                  className="tag-remove"
                  onClick={() => dispatch({ type: 'REMOVE_SYSTEMD_UNIT', index: i })}
                >
                  x
                </button>
              </div>
              <pre className="unit-contents">{unit.contents}</pre>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addUnit} className="add-unit-form">
        <div className="form-group">
          <label>Start from a template</label>
          <div className="template-grid">
            {UNIT_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                className={`image-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                onClick={() => applyTemplate(tpl.id)}
              >
                <strong>{tpl.name}</strong>
                <span className="image-description">{tpl.description}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedTemplate && UNIT_TEMPLATES.find(t => t.id === selectedTemplate)?.hint && (
          <div className="template-hint">
            {UNIT_TEMPLATES.find(t => t.id === selectedTemplate).hint}
          </div>
        )}

        <div className="form-group">
          <label>Unit filename</label>
          <input
            type="text"
            placeholder="my-service.service"
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
          />
          <span className="form-hint">
            Use .service, .container, .timer, .mount, etc.
          </span>
        </div>

        <div className="form-group">
          <label>Unit contents</label>
          <textarea
            rows={10}
            className="mono"
            placeholder="[Unit]&#10;Description=...&#10;&#10;[Service]&#10;ExecStart=..."
            value={unitContents}
            onChange={e => setUnitContents(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-secondary">
          + Add unit
        </button>
      </form>
    </div>
  )
}
