import { useState } from 'react'
import { WizardProvider, useWizard } from './hooks/useWizardState'
import Wizard from './components/Wizard'
import StepIndicator from './components/StepIndicator'
import ContainerfilePreview from './components/ContainerfilePreview'
import './App.css'

const SNARKY_MESSAGES = [
  '$ sudo rm -rf /light-mode',
  '$ echo "Nice try." >> /dev/null',
  '$ chmod 000 /usr/share/themes/light',
  '$ systemctl disable --now light-mode.service',
  '$ firewall-cmd --permanent --add-rich-rule=\'rule family="ipv4" source address="0.0.0.0/0" service name="light-mode" reject\'',
  '$ journalctl -u light-mode | tail -1\n  "Unit light-mode.service not found."',
  '$ cat /etc/motd\n  Dark mode only. No exceptions.',
  '$ man light-mode\n  No manual entry for light-mode',
  '$ dnf remove light-mode\n  No match for argument: light-mode',
  '$ grep -r "light" /etc/daedalus/\n  /etc/daedalus/config: theme=dark # do not change',
]

function App() {
  const [snark, setSnark] = useState(null)

  function handleThemeToggle() {
    setSnark(null)
    requestAnimationFrame(() => {
      const msg = SNARKY_MESSAGES[Math.floor(Math.random() * SNARKY_MESSAGES.length)]
      setSnark(msg)
    })
    clearTimeout(window._snarkTimer)
    window._snarkTimer = setTimeout(() => setSnark(null), 8000)
  }

  return (
    <WizardProvider>
      <div className="app dark">
        <header className="app-header">
          <div className="app-title">
            <img src="/favicon.svg" alt="" className="app-logo" />
            <div>
              <h1>daedalus</h1>
              <span className="app-subtitle">forge your bootable OS</span>
            </div>
          </div>
          <div className="header-right">
            {snark && <span className="snark-message">{snark}</span>}
            <button
              className="theme-toggle"
              onClick={handleThemeToggle}
              title="Switch to light mode"
            >
              Light
            </button>
          </div>
        </header>
        <AppMain />
      </div>
    </WizardProvider>
  )
}

function AppMain() {
  const { state, dispatch } = useWizard()

  function goTo(step) {
    dispatch({ type: 'SET_STEP', payload: step })
  }

  return (
    <main className="app-main">
      <aside className="step-sidebar">
        <StepIndicator currentStep={state.currentStep} onStepClick={goTo} />
      </aside>
      <div className="wizard-pane">
        <Wizard />
      </div>
      <div className="preview-pane">
        <ContainerfilePreview />
      </div>
    </main>
  )
}

export default App
