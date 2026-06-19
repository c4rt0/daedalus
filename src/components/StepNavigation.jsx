export default function StepNavigation({ currentStep, totalSteps, onBack, onNext }) {
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div className="step-navigation">
      <button
        className="btn btn-secondary"
        onClick={onBack}
        disabled={isFirst}
      >
        Back
      </button>
      {!isLast && (
        <button className="btn btn-primary" onClick={onNext}>
          Next
        </button>
      )}
    </div>
  )
}
