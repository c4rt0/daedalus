import { createContext, useContext, useReducer } from 'react'

const WizardContext = createContext()

const initialState = {
  currentStep: 0,
  baseImage: 'quay.io/fedora/fedora-bootc:44',
  customBaseImage: '',
  osName: '',
  hostname: '',
  purpose: '',
  motd: '',
  logo: null,
  packages: [],
  customPackages: '',
  customRepos: [],
  timezone: 'UTC',
  locale: 'en_US.UTF-8',
  sshKeys: '',
  enabledServices: [],
  firewall: { services: [], ports: [] },
  // Butane/Ignition — FCOS first-boot provisioning
  users: [{ name: 'core', sshKeys: '', passwordHash: '', groups: ['wheel'], shell: '/bin/bash', homeDir: '' }],
  storageFiles: [],
  storageDirectories: [],
  storageDisks: [],
  storageFilesystems: [],
  storageLuks: [],
  storageRaid: [],
  systemdUnits: [],
  // bootc auto-updates
  updateStrategy: 'enabled',
  updateOnBootSec: '1h',
  updateInterval: '8h',
  // Networking
  networkConfig: [],
  // Build options
  imageBuilder: 'image-builder',
  // System extensions (sysexts)
  extensions: [],
  customExtensions: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value }
    case 'ADD_PACKAGE':
      if (state.packages.includes(action.payload)) return state
      return { ...state, packages: [...state.packages, action.payload] }
    case 'REMOVE_PACKAGE':
      return { ...state, packages: state.packages.filter(p => p !== action.payload) }
    case 'ADD_PACKAGES':
      const newPkgs = action.payload.filter(p => !state.packages.includes(p))
      return { ...state, packages: [...state.packages, ...newPkgs] }
    case 'REMOVE_PACKAGES':
      return { ...state, packages: state.packages.filter(p => !action.payload.includes(p)) }
    case 'ADD_REPO':
      return { ...state, customRepos: [...state.customRepos, action.payload] }
    case 'REMOVE_REPO':
      return { ...state, customRepos: state.customRepos.filter((_, i) => i !== action.payload) }
    case 'TOGGLE_SERVICE':
      const services = state.enabledServices.includes(action.payload)
        ? state.enabledServices.filter(s => s !== action.payload)
        : [...state.enabledServices, action.payload]
      return { ...state, enabledServices: services }
    case 'ADD_FIREWALL_SERVICE':
      if (state.firewall.services.includes(action.payload)) return state
      return { ...state, firewall: { ...state.firewall, services: [...state.firewall.services, action.payload] } }
    case 'REMOVE_FIREWALL_SERVICE':
      return { ...state, firewall: { ...state.firewall, services: state.firewall.services.filter(s => s !== action.payload) } }
    case 'ADD_FIREWALL_PORT':
      if (state.firewall.ports.includes(action.payload)) return state
      return { ...state, firewall: { ...state.firewall, ports: [...state.firewall.ports, action.payload] } }
    case 'REMOVE_FIREWALL_PORT':
      return { ...state, firewall: { ...state.firewall, ports: state.firewall.ports.filter(p => p !== action.payload) } }
    case 'ADD_USER':
      return { ...state, users: [...state.users, { name: '', sshKeys: '', passwordHash: '', groups: [], shell: '/bin/bash', homeDir: '' }] }
    case 'UPDATE_USER': {
      const users = state.users.map((u, i) => i === action.index ? { ...u, [action.field]: action.value } : u)
      return { ...state, users }
    }
    case 'REMOVE_USER':
      return { ...state, users: state.users.filter((_, i) => i !== action.index) }
    case 'ADD_SYSTEMD_UNIT':
      return { ...state, systemdUnits: [...state.systemdUnits, action.payload] }
    case 'REMOVE_SYSTEMD_UNIT':
      return { ...state, systemdUnits: state.systemdUnits.filter((_, i) => i !== action.index) }
    case 'ADD_STORAGE_FILE':
      return { ...state, storageFiles: [...state.storageFiles, action.payload] }
    case 'REMOVE_STORAGE_FILE':
      return { ...state, storageFiles: state.storageFiles.filter((_, i) => i !== action.index) }
    case 'ADD_EXTENSION':
      if (state.extensions.includes(action.payload)) return state
      return { ...state, extensions: [...state.extensions, action.payload] }
    case 'REMOVE_EXTENSION':
      return { ...state, extensions: state.extensions.filter(e => e !== action.payload) }
    case 'ADD_LIST_ITEM':
      return { ...state, [action.field]: [...state[action.field], action.payload] }
    case 'REMOVE_LIST_ITEM':
      return { ...state, [action.field]: state[action.field].filter((_, i) => i !== action.index) }
    default:
      return state
  }
}

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) throw new Error('useWizard must be used within WizardProvider')
  return context
}
