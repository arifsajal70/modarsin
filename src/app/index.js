const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')

let win
app.commandLine.appendSwitch('disable-features', 'IOSurfaceCapturer')
const createWindow = () => {
	win = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webviewTag: true,
		}
	})
	
	win.setContentProtection(true)
	win.loadFile(path.join(__dirname, '..\\view\\index.html'))
	
	win.addListener('maximize', function (e) {
		win.webContents.send('maximize-window')
	})
	
	win.addListener('unmaximize', function (e) {
		win.webContents.send('restore-window')
	})
}

app.whenReady().then(async () => {
	const menu = Menu.buildFromTemplate([])
	Menu.setApplicationMenu(menu)
	
	createWindow()
	
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('new-tab', function (event, data) {
	win.webContents.send('new-tab', data)
})

ipcMain.on('switch-tab', function (event, data) {
	win.webContents.send('switch-tab', data)
})

ipcMain.on('close-tab', function (event, data) {
	win.webContents.send('close-tab', data)
})

ipcMain.on('close-app', function (event) {
	app.quit()
})

ipcMain.on('app-maximize', function (event) {
	win.maximize()
})

ipcMain.on('app-restore', function (event) {
	win.restore()
})

ipcMain.on('app-minimize', function (event) {
	win.minimize()
})

ipcMain.on('tab-go-home', function (event) {
	win.webContents.send('tab-go-home')
})

ipcMain.on('tab-go-backward', function (event) {
	win.webContents.send('tab-go-backward')
})

ipcMain.on('tab-go-forward', function (event) {
	win.webContents.send('tab-go-forward')
})

ipcMain.on('tab-do-refresh', function (event) {
	win.webContents.send('tab-do-refresh')
})
