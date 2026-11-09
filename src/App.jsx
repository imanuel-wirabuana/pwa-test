import { useState, useEffect } from 'react'
import './App.css'

export default App

function App() {
  const [permission, setPermission] = useState('default')
  const [swReady, setSwReady] = useState(false)
  const [title, setTitle] = useState('React PWA Alert')
  const [body, setBody] = useState('Hello! This is a notification from your Vite React PWA 🚀')
  const [statusMessage, setStatusMessage] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // Check notification support and permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    } else {
      setPermission('unsupported')
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwReady(true)
      }).catch((err) => {
        console.error('Service Worker ready error:', err)
      })
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already running standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Request Notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setStatusMessage('Notifications are not supported in this browser.')
      return
    }

    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === 'granted') {
        setStatusMessage('Notification permission granted!')
      } else {
        setStatusMessage(`Notification permission status: ${res}`)
      }
    } catch (err) {
      console.error(err)
      setStatusMessage('Error requesting permission.')
    }
  }

  // Core trigger notification function
  const triggerNotification = async (notificationTitle, notificationBody) => {
    if (!('Notification' in window)) {
      setStatusMessage('Notification API not supported.')
      return
    }

    let currentPermission = Notification.permission
    if (currentPermission !== 'granted') {
      currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)
      if (currentPermission !== 'granted') {
        setStatusMessage('Please grant notification permission first.')
        return
      }
    }

    const options = {
      body: notificationBody,
      icon: '/pwa-192x192.svg',
      badge: '/pwa-192x192.svg',
      vibrate: [200, 100, 200],
      tag: 'pwa-instant-notification',
      renotify: true,
      data: {
        timestamp: Date.now(),
        url: window.location.href,
      },
    }

    // Attempt via Service Worker registration first (standard for PWAs)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(notificationTitle, options)
        setStatusMessage(`Sent notification via Service Worker at ${new Date().toLocaleTimeString()}`)
        return
      } catch (err) {
        console.warn('SW showNotification failed, trying fallback:', err)
      }
    }

    // Fallback to Notification constructor
    try {
      new Notification(notificationTitle, options)
      setStatusMessage(`Sent notification at ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      console.error('Notification failed:', err)
      setStatusMessage(`Notification failed: ${err.message}`)
    }
  }

  // Send Delayed Notification (e.g., 5 seconds)
  const scheduleNotification = () => {
    if (countdown !== null) return
    let secondsLeft = 5
    setCountdown(secondsLeft)
    setStatusMessage('Notification scheduled in 5 seconds. You can minimize or lock screen now!')

    const intervalId = setInterval(() => {
      secondsLeft -= 1
      if (secondsLeft > 0) {
        setCountdown(secondsLeft)
      } else {
        clearInterval(intervalId)
        setCountdown(null)
        triggerNotification(title, body)
      }
    }, 1000)
  }

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-badge">
          <img src="/pwa-192x192.svg" alt="App Logo" className="app-logo" />
        </div>
        <h1>Vite React PWA</h1>
        <p className="subtitle">Simple Progressive Web App with Notifications</p>
      </header>

      <section className="card status-card">
        <h2>App &amp; Notification Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Notifications:</span>
            <span className={`badge badge-${permission}`}>
              {permission.toUpperCase()}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Service Worker:</span>
            <span className={`badge ${swReady ? 'badge-granted' : 'badge-default'}`}>
              {swReady ? 'ACTIVE' : 'INITIALIZING'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">PWA Mode:</span>
            <span className="badge badge-default">
              {isInstalled ? 'STANDALONE (INSTALLED)' : 'BROWSER TAB'}
            </span>
          </div>
        </div>

        {installPrompt && (
          <button className="btn btn-secondary install-btn" onClick={handleInstallClick}>
            📲 Install PWA to Device
          </button>
        )}
      </section>

      <section className="card action-card">
        <h2>Send Notification</h2>

        <div className="form-group">
          <label htmlFor="title-input">Notification Title</label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="body-input">Notification Message</label>
          <textarea
            id="body-input"
            rows="3"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter notification message..."
          />
        </div>

        <div className="button-group">
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button className="btn btn-accent" onClick={requestPermission}>
              🔔 Request Permission
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => triggerNotification(title, body)}
            disabled={permission === 'denied' || permission === 'unsupported'}
          >
            🚀 Send Immediate Notification
          </button>

          <button
            className="btn btn-outline"
            onClick={scheduleNotification}
            disabled={countdown !== null || permission === 'denied' || permission === 'unsupported'}
          >
            ⏱️ {countdown !== null ? `Sending in ${countdown}s...` : 'Send in 5 Seconds'}
          </button>
        </div>

        {statusMessage && (
          <div className="status-message">
            {statusMessage}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>Tip: On Android &amp; iOS (Safari 16.4+), install to home screen to test full background notifications.</p>
      </footer>
    </div>
  )
}
