import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Dummy config - this needs to be populated by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:0000000000:web:dummy",
}

const app = initializeApp(firebaseConfig)

// Only initialize messaging if supported (e.g. not in all browsers/environments)
let messaging = null
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app)
  } catch (err) {
    console.error('Failed to initialize Firebase Messaging', err)
  }
}

export const requestNotificationPermission = async () => {
  if (!messaging) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      })
      console.log('FCM Token:', token)
      return token
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error)
  }
  return null
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
