import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBQ4ERHQOul6Y6NydTH4sZS0v9rn_A9yUk",
  authDomain: "phoolpaudha-19160.firebaseapp.com",
  projectId: "phoolpaudha-19160",
  storageBucket: "phoolpaudha-19160.firebasestorage.app",
  messagingSenderId: "716028375034",
  appId: "1:716028375034:web:6366a980922f7b1a2fbe43",
  measurementId: "G-QB8BWLSYPS"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let messaging = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, messaging };

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase messaging not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Add this from Firebase Console
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen to foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
