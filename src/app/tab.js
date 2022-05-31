const {ipcRenderer} = require('electron')

let tabs = []
let activeTab = 0

const addTab = ({title, url, active= false}) => {
	
	const id = tabs.length
	const item = {
		id: id,
		title: title,
		url: url
	}
	
	if (active) {
		const at = getTab(activeTab)
		activeTab = id
		if (at) {
			at.tab.className = 'tab'
			at.view.style.display = 'none'
		}
	}
	
	const tab = addNewTab(item)
	const view = addNewView(item)
	
	item.tab = tab
	item.view = view
	
	if (active) {
		switchTab(id)
	}
	
	tabs.push(item)
	
}

const getTabs = () => {
	return tabs
}

const getTab = (id) => {
	return tabs[id]
}

const switchTab = (id) => {
	const prevTab = getTab(activeTab)
	if (prevTab) {
		prevTab.view.style.display = 'none'
		prevTab.tab.className = 'tab'
	}
	
	const switchable = getTab(id)
	if (switchable) {
		switchable.view.style.display = ''
		switchable.tab.className = 'tab active'
	}
	
	activeTab = id
}

const closeTab = (id) => {
	const tab = getTab(id)
	const at = id === activeTab
	tab.tab.parentNode.removeChild(tab.tab)
	tab.view.parentNode.removeChild(tab.view)
	delete tabs[id]
	
	if (at){
		const closestTab = closest(id, tabs)
		closestTab && switchTab(closestTab.id)
	}
}

function closest(num, objects) {
	const arr = objects.map((object, index) => index)
	const index = Math.max.apply(null, arr.filter(function(v){return v <= num}))
	const object = objects[index]
	if (object === undefined) {
		addTab({
			title: "Modarsin Portal",
			url: "https://www.modarsin.com",
			active: true
		})
	} else {
		return objects[index];
	}
}

const addNewTab = (item) => {
	const tabSection = document.getElementById('tabs')
	
	const $tabFavicon = document.createElement('img')
	$tabFavicon.className = 'tab-favicon'
	$tabFavicon.src = `https://s2.googleusercontent.com/s2/favicons?domain=${item.url}`
	
	const $tabTitle = document.createElement('div')
	$tabTitle.className = 'tab-title'
	$tabTitle.append(item.title)
	
	const $tabInfo = document.createElement('div')
	$tabInfo.className = 'tab-info'
	$tabInfo.append($tabFavicon)
	$tabInfo.append($tabTitle)
	
	const $tabCloseIcon = document.createElement('i')
	$tabCloseIcon.className = 'fa-regular fa-xmark tab-close'
	
	const $tabCloseButton = document.createElement('button')
	$tabCloseButton.className = `tab-close`
	$tabCloseButton.id = `tab-close-${item.id}`
	$tabCloseButton.onclick = () => ipcRenderer.send('close-tab', item.id)
	$tabCloseButton.append($tabCloseIcon)
	
	const $tab = document.createElement('div')
	$tab.className = `tab${item.id === activeTab ? ' active' : ''}`
	$tab.id = `tab-${item.id}`
	$tab.append($tabInfo)
	$tab.append($tabCloseButton)
	
	tabSection.append($tab)
	return $tab
}

const addNewView = (item) => {
	const viewSection = document.getElementById('appViews')
	const $webview = document.createElement('webview')
	$webview.className = `view`
	$webview.id = `view-${item.id}`
	$webview.setAttribute('preload', '../assets/js/preloader.js')
	$webview.src = item.url
	$webview.style.display = item.id === activeTab ? '' : 'none'
	$webview.webpreferences="nativeWindowOpen=yes"
	$webview.allowpopups=false
	$webview.partition='persist:modarsin'
	
	viewSection.append($webview)
	return $webview
}

const maximizeWindow = () => {
	document.getElementsByClassName('fa-window-restore')[0].style.display = ''
	document.getElementsByClassName('fa-window-maximize')[0].style.display = 'none'
}

const restoreWindow = () => {
	document.getElementsByClassName('fa-window-maximize')[0].style.display = ''
	document.getElementsByClassName('fa-window-restore')[0].style.display = 'none'
}

onload = () => {
	if (getTabs().length  === 0) {
		addTab({
			title: "Modarsin Portal",
			url: "https://www.modarsin.com",
			active: true
		})
	}
	
	document.querySelector('body').addEventListener('click', function (e) {
		console.log(e.target.className.startsWith('tab'))
		if (e.target.className.startsWith('tab') && !e.target.className.startsWith('tab-close')) {
			const id = Number(e.target.id.replace('tab-', ''))
			switchTab(id)
		}
		
		if(e.target.classList.contains('fa-xmark-large')) {
			ipcRenderer.send('close-app')
		}
		
		if(e.target.classList.contains('fa-window-maximize')) {
			maximizeWindow()
			ipcRenderer.send('app-maximize')
		}
		
		if(e.target.classList.contains('fa-window-restore')) {
			restoreWindow()
			ipcRenderer.send('app-restore')
		}
		
		if(e.target.classList.contains('fa-window-minimize')) {
			ipcRenderer.send('app-minimize')
		}
		
		if(e.target.classList.contains('fa-house')) {
			ipcRenderer.send('tab-go-home')
		}
		
		if(e.target.classList.contains('fa-forward-step')) {
			ipcRenderer.send('tab-go-forward')
		}
		
		if(e.target.classList.contains('fa-backward-step')) {
			ipcRenderer.send('tab-go-backward')
		}
		
		if(e.target.classList.contains('fa-arrows-repeat')) {
			ipcRenderer.send('tab-do-refresh')
		}
	})
	
	ipcRenderer.on('new-tab', function (event, data) {
		data.active = true
		addTab(data)
	})
	
	ipcRenderer.on('switch-tab', function (event, data) {
		switchTab(data)
	})
	
	ipcRenderer.on('close-tab', function (event, data) {
		closeTab(data)
	})
	
	ipcRenderer.on('tab-go-home', function (event) {
		const tab = getTab(activeTab)
		tab.view.loadURL('https://www.modarsin.com')
	})
	
	ipcRenderer.on('tab-go-backward', function (event) {
		const tab = getTab(activeTab)
		tab.view.canGoBack() && tab.view.goBack()
	})
	
	ipcRenderer.on('tab-go-forward', function (event) {
		const tab = getTab(activeTab)
		tab.view.canGoForward() && tab.view.goForward()
	})
	
	ipcRenderer.on('tab-do-refresh', function (event) {
		const tab = getTab(activeTab)
		tab.view.reload()
	})
	
	ipcRenderer.on('maximize-window', function (event) {
		maximizeWindow()
	})
	
	ipcRenderer.on('restore-window', function (event) {
		restoreWindow()
	})
}
