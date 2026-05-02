# Emergency Fallback Architecture v2 (React App Integration)

You want a workflow where the user connects to the robot's WiFi in their phone's settings, and then uses the **actual React Web App** to control it, instead of a barebones captive portal page.

## The Technical Challenge
When a phone connects to the robot's WiFi (`FIREBOT_001`), the phone **loses access to the internet**. 
If there is no internet:
1. The app cannot talk to Firebase (so our new `rtdb` cloud commands will fail).
2. If the user doesn't *already* have the React app open on their phone, the browser cannot download the React app files from the web server.

## The Solution: "Dual Mode" Fallback

To build precisely what you asked for, we will implement this hybrid approach:

### 1. ESP32 Auto-Fallback to AP Mode
If the home router loses power for >10 seconds, the ESP32 switches into Access Point mode and broadcasts its name (e.g., `FIREBOT_001`).
It will also start a **local HTTP server** on `192.168.4.1` (just like our very first iteration).

### 2. React App "Emergency Offline" Feature
We will add a special **"Emergency Local Connect"** button on the Guest Dashboard.
Here is the workflow:
1. A fire starts, power goes out.
2. The user goes to their phone's settings and connects exactly as you described: WiFi Name `FIREBOT_001`.
3. The user opens the React Web App on their phone (they must have left it open, or we build it as an offline PWA app later).
4. Because there is no internet, the regular Cloud connection fails. The user taps **"Emergency Local Connect"**.
5. The React app switches its code to blast raw HTTP POST commands (e.g. `http://192.168.4.1/api/send-command`) directly over the local WiFi to the robot.

### 3. The Ultimate Safety Net (The Captive Portal)
Just in case the guest *doesn't* have your React app open on their phone before the internet dies, the ESP32 will still fire its Captive Portal. It will pop up a raw emergency page immediately upon them connecting to the WiFi. This guarantees they can control the robot 100% of the time, no matter what.

---

## Action Plan

We will need to re-introduce the `ESPAsyncWebServer` to the Arduino code. The ESP32 will run **both** the Firebase client (for when the router is alive) AND an AsyncWebServer (for when the router is dead).

**Are you ready for me to modify the Arduino code to support this local AP fallback?**
