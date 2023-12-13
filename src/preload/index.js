import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  send_notification: async (data) => {
    console.log('preload:', data)
    const result = await ipcRenderer.invoke('send', data)
    return result
  },
  update: async (data) => {
    console.log('preload:', data)
    const result = await ipcRenderer.send('update', data)
    return result
  },
  save: async (data) => {
    console.log('preload:', data)
    const result = await ipcRenderer.send('save', data)
    return result
  },
  get_status: async (data) => {
    console.log('preload:', data)
    const result = await ipcRenderer.invoke('get_status', data)
    return result
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('myAPI', {
      desktop: true
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.myAPI = {
    desktop: true
  }
}
console.log('world')
