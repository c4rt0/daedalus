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
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="app-logo" />
            <div>
              <h1>daedalus</h1>
              <span className="app-subtitle">forge your bootable OS</span>
            </div>
          </div>
          <div className="header-right">
            {snark && <span className="snark-message">{snark}</span>}
            <a
              href="https://github.com/c4rt0/daedalus"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              title="View on GitHub"
            >
              <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
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
