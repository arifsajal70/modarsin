const {ipcRenderer} = require('electron')

onload = () => {
	appendNoSelect()
	
	document.querySelector('body').addEventListener('click', function(event) {
		if (
			(event.target.id.startsWith('recording-play-presentation-') || event.target.classList.contains('bbb-btn-action')) &&
			event.target.id !== 'end_button_input'
		) {
			event.preventDefault()
			
			const data = {
				url: event.target.href,
				title: document.title
			}
			
			ipcRenderer.send('new-tab', data)
		}
		
		if (event.target.hasOwnProperty('target') && event.target.target === '_blank' && event.target.hasOwnProperty('href')) {
			event.preventDefault()
			
			const data = {
				url: event.target.href,
				title: document.title
			}
			
			ipcRenderer.send('new-tab', data)
		}
	});
}

const appendNoSelect = () => {
	const css = 'body{user-select: none; -webkit-user-select: none; -moz-user-select: none;}',
		body = document.body || document.querySelector('body'),
		style = document.createElement('style');
	
	body.appendChild(style);
	
	style.type = 'text/css';
	if (style.styleSheet){
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
}
