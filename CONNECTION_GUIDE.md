# 🔌 FireBot Connection Guide

This guide explains exactly how the ESP32 hardware and the React web app communicate over your local WiFi network.

---

## The Big Picture
1. Your **Web App** (running on your phone or laptop) and your **ESP32** are BOTH connected to the exact same Home WiFi Router.
2. The ESP32 is running a miniature web server on port 80.
3. The Web App sends commands (like "Move Forward") directly to the ESP32's IP Address over the local network using HTTP.
4. If a fire starts or stops, the ESP32 reaches out to the Internet (Firebase) to save the event. The Web App sees that event in Firebase and shows you a notification.

---

## Step 1: Connect the ESP32 to your Home WiFi
Open the `esp32_firebot_wifi_standalone.ino` file in the Arduino IDE.

Find these two lines near the top and type in your exact Home WiFi name and password:
```cpp
const char* WIFI_SSID     = "MyHomeWiFiNetwork"; // Put your actual WiFi name here!
const char* WIFI_PASSWORD = "MyWifiPassword123"; // Put your actual WiFi password here!
```

### Upload and Find the IP Address
1. Plug your ESP32 into your computer via USB.
2. Click **Upload** in the Arduino IDE.
3. Open the **Serial Monitor** (set baud rate to `115200`).
4. Wait for the ESP32 to connect. It will print something like:
   ```text
   ✅ WiFi connected!
      IP Address: 192.168.1.45
   ```
5. **Write down that IP address.** You will need it in the next step.

---

## Step 2: Connect the Web App to the ESP32
Now that the ESP32 is on your network, you need to tell the web app where to find it.

1. Ensure your phone or laptop (wherever you are viewing the web app) is connected to the **SAME** Home WiFi network as the ESP32.
2. Open the FireBot Web App in your browser.
3. Log in (as Owner or Guest).
4. On the dashboard, locate the **"FireBot Connection"** box.
5. Click the small **Gear / Settings icon** (⚙️) next to the IP address.
6. A popup will appear. Type the IP address you got from the Serial Monitor (e.g., `192.168.1.45`).
7. Click **Save**.
8. Click the orange **"Connect to Bot"** button.

The app will now send commands directly to the ESP32 over your local network!

---

## Summary of the Code bridging the two:

**In the React App (`src/services/wifiService.ts`)**
The App takes the IP you entered and sends HTTP POST requests to it when you click buttons:
```javascript
// Example of the app sending a command:
fetch("http://192.168.1.45/api/send-command", {
  method: 'POST',
  body: JSON.stringify({ command: "FORWARD" })
})
```

**In the ESP32 (`esp32_firebot_wifi_standalone.ino`)**
The ESP32 listens on that IP address, receives the HTTP POST request, reads the word `"FORWARD"`, and triggers the motors:
```cpp
void handleSendCommand() {
  String command = server.arg("plain"); // Reads the incoming request
  
  if (command.indexOf("FORWARD") > 0) {
    moveForward(); // Turns on the motor pins!
  }
}
```
