import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useWizard } from '../hooks/useWizardState'
import { generateContainerfile } from '../generator/containerfile'
import { generateButane } from '../generator/butane'
import { generateBuildScript } from '../generator/buildscript'

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ContainerfilePreview() {
  const { state } = useWizard()
  const [activeTab, setActiveTab] = useState('containerfile')
  const [copied, setCopied] = useState(false)

  const containerfile = generateContainerfile(state)
  const butane = generateButane(state)
  const buildScript = generateBuildScript(state)

  const hasButane = butane.trim() !== ''

  const tabs = [
    { id: 'containerfile', label: 'Containerfile', language: 'dockerfile', filename: 'Containerfile' },
    ...(hasButane ? [{ id: 'butane', label: 'Butane', language: 'yaml', filename: 'config.bu' }] : []),
    { id: 'build', label: 'build.sh', language: 'bash', filename: 'build.sh' },
  ]

  const contentMap = { containerfile, butane, build: buildScript }
  const content = contentMap[activeTab] || containerfile
  const tab = tabs.find(t => t.id === activeTab) || tabs[0]

  if (!tabs.some(t => t.id === activeTab)) {
    setActiveTab('containerfile')
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadAll() {
    downloadFile(containerfile, 'Containerfile')
    let delay = 100
    if (hasButane) {
      setTimeout(() => downloadFile(butane, 'config.bu'), delay)
      delay += 100
    }
    setTimeout(() => downloadFile(buildScript, 'build.sh'), delay)
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`preview-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="preview-actions">
          <button className="btn btn-small" onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-small" onClick={downloadAll}>
            Download All
          </button>
        </div>
      </div>
      <div className="preview-code">
        <SyntaxHighlighter
          language={tab.language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.85rem',
            lineHeight: '1.5',
            minHeight: '100%',
          }}
          showLineNumbers
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
