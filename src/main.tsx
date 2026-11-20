import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { rememberReferral } from './lib/router'
import './index.css'

// CDM Studio never runs inside another site's frame (stops "clickjacking" tricks on buttons like Pay or Transfer)
if (window.top !== window.self) {
  document.body.innerHTML = '<p style="font-family:system-ui;padding:24px">Open CDM Studio directly: <a target="_top" href="' + location.href.replace(/"/g, '') + '">' + location.host + '</a></p>'
  throw new Error('framed')
}
rememberReferral()
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
