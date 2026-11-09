# Simple Vite React PWA with Notifications

A lightweight Vite + React Progressive Web App (PWA) with built-in Web Notification support and service worker registration.

## Features

- ⚡ **Vite + React**: Fast build & Hot Module Replacement (HMR).
- 📱 **PWA Ready**: Configured with `vite-plugin-pwa`, Web App Manifest, and Service Worker.
- 🔔 **Push / Web Notifications**:
  - Request notification permission.
  - Send immediate notifications via Service Worker (fallback to Notification API).
  - Schedule notifications with a 5-second delay to test notifications with the app in the background.
- 📲 **Installable**: Supports browser `beforeinstallprompt` event to install as standalone app.

## Getting Started

### 1. Run Development Server
```bash
npm run dev
```

### 2. Run Production Preview (Recommended for PWA testing)
PWAs and Service Workers run best in production mode or preview:
```bash
npm run build
npm run preview
```

Open your browser to `http://localhost:4173` (or `http://localhost:5173`).

## How to Test Notifications

1. Click **"Request Permission"** to allow browser notifications.
2. Click **"Send Immediate Notification"** to test an instant alert.
3. Click **"Send in 5 Seconds"** and immediately minimize the browser window or switch tabs to see the background notification appear in your OS notification center.
