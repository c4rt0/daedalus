import { useWizard } from '../hooks/useWizardState'
import StepNavigation from './StepNavigation'
import BaseImageStep from './steps/BaseImageStep'
import IdentityStep from './steps/IdentityStep'
import UsersStep from './steps/UsersStep'
import BrandingStep from './steps/BrandingStep'
import PackagesStep from './steps/PackagesStep'
import ConfigStep from './steps/ConfigStep'
import SystemdStep from './steps/SystemdStep'
import UpdatesStep from './steps/UpdatesStep'
import ReviewStep from './steps/ReviewStep'

const steps = [
  BaseImageStep,
  IdentityStep,
  UsersStep,
  PackagesStep,
  ConfigStep,
  BrandingStep,
  SystemdStep,
  UpdatesStep,
  ReviewStep,
]

export const STEP_COUNT = steps.length

export default function Wizard() {
  const { state, dispatch } = useWizard()
  const StepComponent = steps[state.currentStep]

  function goTo(step) {
    dispatch({ type: 'SET_STEP', payload: step })
  }

  return (
    <div className="wizard">
      <div className="wizard-content">
        <StepComponent />
      </div>
      <StepNavigation
        currentStep={state.currentStep}
        totalSteps={STEP_COUNT}
        onBack={() => goTo(state.currentStep - 1)}
        onNext={() => goTo(state.currentStep + 1)}
      />
    </div>
  )
}
