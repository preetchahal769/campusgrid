// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
import { apiFetch } from "./api";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2esAaVoYhPe5GXwqXHzltSaOq2Y7m_bc",
  authDomain: "campusgrid-d9e84.firebaseapp.com",
  projectId: "campusgrid-d9e84",
  storageBucket: "campusgrid-d9e84.firebasestorage.app",
  messagingSenderId: "275500683433",
  appId: "1:275500683433:web:e94d4d39f1aa0fc6bd99b8",
  measurementId: "G-N8L8H47Y5Y"
};

export const VAPID_KEY = "BGfaS8SmjGXhhKTQMjpgtObVXsKr5gaL7-BgDxg7rVixZUHyFBhxzTI8o98e4zZRyfBM5wT6_nCD1tSvg_1Z-3U";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Analytics and Messaging (Client-side only)
export const initFirebase = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported();
    const analytics = analyticsSupported ? getAnalytics(app) : null;
    const messaging = getMessaging(app);
    return { app, analytics, messaging };
  }
  return { app };
};

export const requestForToken = async () => {
  try {
    const { getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const syncTokenWithBackend = async (token: string) => {
  try {
    await apiFetch('/users/fcm-token', {
      method: 'PATCH',
      body: JSON.stringify({ fcmToken: token })
    });
    console.log("FCM Token synced with backend");
  } catch (error) {
    console.error("Failed to sync FCM Token:", error);
  }
};

export { app };
