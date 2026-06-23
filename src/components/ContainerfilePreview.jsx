import { useState, useRef, useEffect } from 'react'
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

function dosDateTime() {
  const d = new Date()
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  return { time, date }
}

function downloadZip(files, zipName) {
  const enc = new TextEncoder()
  const entries = files.map(f => ({ name: enc.encode(f.name), data: enc.encode(f.content) }))
  const parts = []
  const centralDir = []
  let offset = 0
  const { time, date } = dosDateTime()

  for (const entry of entries) {
    const header = new Uint8Array(30 + entry.name.length)
    const view = new DataView(header.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(10, time, true)
    view.setUint16(12, date, true)
    view.setUint16(26, entry.name.length, true)
    const crc = crc32(entry.data)
    view.setUint32(14, crc, true)
    view.setUint32(18, entry.data.length, true)
    view.setUint32(22, entry.data.length, true)
    header.set(entry.name, 30)
    parts.push(header, entry.data)

    const cd = new Uint8Array(46 + entry.name.length)
    const cdv = new DataView(cd.buffer)
    cdv.setUint32(0, 0x02014b50, true)
    cdv.setUint16(12, time, true)
    cdv.setUint16(14, date, true)
    cdv.setUint32(16, crc, true)
    cdv.setUint32(20, entry.data.length, true)
    cdv.setUint32(24, entry.data.length, true)
    cdv.setUint16(28, entry.name.length, true)
    cdv.setUint32(42, offset, true)
    cd.set(entry.name, 46)
    centralDir.push(cd)

    offset += header.length + entry.data.length
  }

  const cdSize = centralDir.reduce((s, c) => s + c.length, 0)
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, offset, true)

  const blob = new Blob([...parts, ...centralDir, eocd], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  a.click()
  URL.revokeObjectURL(url)
}

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

export default function ContainerfilePreview() {
  const { state } = useWizard()
  const [activeTab, setActiveTab] = useState('containerfile')
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [edits, setEdits] = useState({})
  const textareaRef = useRef(null)

  const containerfile = generateContainerfile(state)
  const butane = generateButane(state)
  const buildScript = generateBuildScript(state)

  const hasButane = butane.trim() !== ''

  const tabs = [
    { id: 'containerfile', label: 'Containerfile', language: 'dockerfile', filename: 'Containerfile' },
    ...(hasButane ? [{ id: 'butane', label: 'Butane', language: 'yaml', filename: 'config.bu' }] : []),
    { id: 'build', label: 'build.sh', language: 'bash', filename: 'build.sh' },
  ]

  const generatedMap = { containerfile, butane, build: buildScript }
  const generated = generatedMap[activeTab] || containerfile
  const content = edits[activeTab] !== undefined ? edits[activeTab] : generated
  const isModified = edits[activeTab] !== undefined && edits[activeTab] !== generated
  const tab = tabs.find(t => t.id === activeTab) || tabs[0]

  if (!tabs.some(t => t.id === activeTab)) {
    setActiveTab('containerfile')
  }

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setEditing(false)
  }

  function toggleEdit() {
    if (!editing && edits[activeTab] === undefined) {
      setEdits(prev => ({ ...prev, [activeTab]: generated }))
    }
    setEditing(!editing)
  }

  function resetTab() {
    setEdits(prev => {
      const next = { ...prev }
      delete next[activeTab]
      return next
    })
    setEditing(false)
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadAll() {
    const files = [
      { name: 'Containerfile', content: edits.containerfile !== undefined ? edits.containerfile : containerfile },
      { name: 'build.sh', content: edits.build !== undefined ? edits.build : buildScript },
    ]
    if (hasButane) files.push({ name: 'config.bu', content: edits.butane !== undefined ? edits.butane : butane })
    const name = state.osName
      ? state.osName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
      : 'daedalus'
    downloadZip(files, `${name}.zip`)
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`preview-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => handleTabChange(t.id)}
            >
              {t.label}
              {edits[t.id] !== undefined && edits[t.id] !== (generatedMap[t.id] || '') && (
                <span className="tab-modified" title="Modified">*</span>
              )}
            </button>
          ))}
        </div>
        <div className="preview-actions">
          <button className={`btn btn-small ${editing ? 'btn-active' : ''}`} onClick={toggleEdit}>
            {editing ? 'Preview' : 'Edit'}
          </button>
          {isModified && (
            <button className="btn btn-small" onClick={resetTab}>
              Reset
            </button>
          )}
          <button className="btn btn-small" onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-small" onClick={downloadAll}>
            Download All
          </button>
        </div>
      </div>
      <div className="preview-code">
        {editing ? (
          <textarea
            ref={textareaRef}
            className="preview-editor"
            value={content}
            onChange={e => setEdits(prev => ({ ...prev, [activeTab]: e.target.value }))}
            spellCheck={false}
          />
        ) : (
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
        )}
      </div>
    </div>
  )
}
