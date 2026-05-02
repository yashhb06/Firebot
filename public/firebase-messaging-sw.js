// Firebase Cloud Messaging Service Worker
// This file MUST be at /public/firebase-messaging-sw.js (served from root)
// It enables background push notifications even when the browser tab is closed.

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase config (same as src/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyABaCepP18z8_eOFz2gFSC-Q-aJrYrZLOU",
  authDomain: "firebot-5077c.firebaseapp.com",
  projectId: "firebot-5077c",
  storageBucket: "firebot-5077c.firebasestorage.app",
  messagingSenderId: "582363810545",
  appId: "1:582363810545:web:9708be6761a4e4be433750",
  measurementId: "G-835Q4R9STW"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || '🔥 FireBot Alert', {
    body: body || 'FireBot has an update for you.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'firebot-alert',
    requireInteraction: true,
  });
});
