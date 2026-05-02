import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your actual Firebase project config
// See FIREBASE_SETUP.md for step-by-step instructions
const firebaseConfig = {
  apiKey: "AIzaSyABaCepP18z8_eOFz2gFSC-Q-aJrYrZLOU",
  authDomain: "firebot-5077c.firebaseapp.com",
  projectId: "firebot-5077c",
  storageBucket: "firebot-5077c.firebasestorage.app",
  messagingSenderId: "582363810545",
  appId: "1:582363810545:web:9708be6761a4e4be433750",
  measurementId: "G-835Q4R9STW"
};

// Detect if user has filled in real values yet
export const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId && firebaseConfig.projectId.length > 5;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Messaging — optional, only used for background notifications
let messaging: any = null;
try {
  const { getMessaging } = require('firebase/messaging');
  messaging = getMessaging(app);
} catch (_) { }
export { messaging };

export default app;
