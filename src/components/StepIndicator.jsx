const steps = [
  'Base Image',
  'Identity',
  'Users',
  'Packages',
  'Configuration',
  'Branding',
  'Systemd',
  'Updates',
  'Review',
]

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <nav className="step-indicator">
      {steps.map((label, i) => (
        <div key={i} className="step-node">
          <button
            className={`step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
            onClick={() => onStepClick(i)}
          >
            <span className="step-diamond">
              <span className="step-diamond-inner">
                {i < currentStep ? '✓' : i + 1}
              </span>
            </span>
            <span className="step-label">{label}</span>
          </button>
          {i < steps.length - 1 && (
            <div className={`step-connector ${i < currentStep ? 'filled' : ''}`} />
          )}
        </div>
      ))}
    </nav>
  )
}
