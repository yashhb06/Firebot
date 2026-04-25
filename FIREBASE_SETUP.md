# 🔥 Firebase Setup Guide for FireBot

Follow these steps **once** to connect the web app and ESP32 to Firebase.

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `firebot` (or any name)
3. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Enable Authentication

1. Left sidebar → **Build → Authentication** → **Get started**
2. Click **"Email/Password"** → Enable it → **Save**
3. Click **"Anonymous"** → Enable it → **Save**

### Create the Owner Account
1. Still in Authentication → **Users** tab → **Add user**
2. Enter your email & a secure password → **Add user**
3. **Copy the User UID** (you'll see it in the Users list) — you may need it for Firestore rules

---

### Step 3: Set up Cloud Database (Firestore & Realtime DB)
We use two databases: **Firestore** for logging historical fire events, and **Realtime Database** for instant hardware control without IP addresses.

**Enable Firestore:**
1. In the left menu, go to **Build** -> **Firestore Database**.
2. Click **Create Database**.
3. Choose **Start in test mode** (this allows you to read/write for 30 days without complex security rules).
4. Choose a location close to you and click **Enable**.

**Enable Realtime Database:**
1. In the left menu, go to **Build** -> **Realtime Database**.
2. Click **Create Database** and choose a location.
3. Choose **Start in test mode** and click **Enable**.
4. Important: Copy the **Database URL** shown at the top of the database viewer (e.g., `https://firebot-xxxxx.firebaseio.com/`). You will need this for your ESP32 code!

### Firestore Security Rules (copy-paste into Rules tab)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Only authenticated users can read fire events
    match /fire_events/{doc} {
      allow read: if request.auth != null;
      // ESP32 uses the API key (unauthenticated) to write — allow writes from server
      allow write: if true;
    }

    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Step 4 — Get Your Firebase Config

1. In Firebase Console → click the ⚙ gear → **Project settings**
2. Scroll to **"Your apps"** → click **"</>  Web"** → Register app (name: `firebot-web`)
3. Copy the `firebaseConfig` object shown

---

## Step 5 — Add Config to the App

Open **`src/firebase.ts`** and replace the placeholder values:

```ts
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← your actual values
  authDomain: "firebot-xxx.firebaseapp.com",
  projectId: "firebot-xxx",
  storageBucket: "firebot-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Also paste the **same config** into **`public/firebase-messaging-sw.js`**.

---

## Step 6 — Add Config to the ESP32

Open **`esp32_firebot_wifi_standalone.ino`** and fill in:

```cpp
const char* WIFI_SSID     = "YourHomeWiFiName";
const char* WIFI_PASSWORD = "YourWiFiPassword";
const char* FIREBASE_PROJECT_ID = "firebot-xxx";  // from firebaseConfig.projectId
const char* FIREBASE_API_KEY    = "AIzaSy...";    // from firebaseConfig.apiKey
```

---

## Step 7 — Upload & Run

1. **ESP32:** Upload the `.ino` file → open Serial Monitor at 115200 baud
   - You'll see the IP address printed (e.g. `192.168.1.45`)
   - Copy this IP
2. **Web App:** Run `npm run dev` → open browser at `http://localhost:5173`
3. Login as Owner with the email/password you created in Step 2
4. Click the ⚙ settings icon next to the bot connection → enter the ESP32 IP

---

## How It All Works

```
ESP32 detects fire
    ↓
ESP32 posts to Firestore /fire_events (via HTTPS REST API)
    ↓
React app listens to Firestore via onSnapshot (real-time)
    ↓
New event detected → shows FireAlert overlay + browser notification to owner
    ↓
Fire suppressed → ESP32 posts suppressed event → owner gets another notification
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| ESP32 can't connect to WiFi | Double-check SSID/password — they're case-sensitive |
| Firestore POST fails | Check that `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` are correct |
| "Invalid email or password" | Make sure you created the owner account in Firebase Auth Step 2 |
| No browser notifications | Click "Allow" when the browser asks for notification permission |
| App shows blank screen | Open DevTools → Console — usually a Firebase config error |
