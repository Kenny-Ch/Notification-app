import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Notification } from 'electron'
const WebSocket = require('ws')
var address = ''
let tray = null
var mainWindow = null
const notice = (title, body) =>
  new Promise((ok, fail) => {
    if (!Notification.isSupported()) fail('当前系统不支持通知')
    let ps = { title, body }
    let n = new Notification(ps)
    n.on('click', ok)
    n.show()
  })

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  ipcMain.handle('send', async (e, data) => {
    console.log(data)
    notice(`阿里云盘`, `已完成文件下载：` + data)
  })
  ipcMain.handle('get_status', async (e, data) => {
    console.log(data)
    return true
  })
  ipcMain.on('update', async (e, data) => {
    sendMessage(data)
    console.log(data)
  })
  ipcMain.on('save', async (e, data) => {
    address = data
    tray.setContextMenu(setMenu())
    console.log(data)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  tray = new Tray(join(__dirname, '../../resources/icon.png'))
  tray.setToolTip('This is my application.')
  tray.setContextMenu(setMenu())
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // createWindow()

  if (process.platform === 'win32') {
    app.setAppUserModelId(process.execPath)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

//处理关于WebSocket客户端内容
const client = new WebSocket('ws://192.168.31.201:8080')
client.on('open', () => {
  console.log('连接已打开')
})
client.on('message', (message) => {
  console.log('收到消息:', message.toString())
  notice(`阿里云盘`, `已完成文件下载：` + message.toString())
})
function sendMessage(message) {
  client.send(message, (error) => {
    if (error) {
      console.error('发送消息失败:', error)
    } else {
      console.log('消息已发送:', message)
    }
  })
}
function setMenu() {
  return Menu.buildFromTemplate([
    {
      label: '打开界面',
      type: 'normal',
      click: () => {
        createWindow()
      }
    },
    { label: '通知', type: 'checkbox', checked: true },
    {
      label: '上报:' + address,
      type: 'normal',
      click: () => {
        sendMessage(address)
      }
    },
    {
      label: '退出',
      type: 'normal',
      click: () => {
        app.quit()
      }
    }
  ])
}
