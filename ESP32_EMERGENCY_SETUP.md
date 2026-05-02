# ESP32 Emergency Fallback (Dual Mode) Setup

This document explains the technical changes required in the Arduino IDE and the ESP32 firmware to support the Offline Emergency AP Fallback feature.

## 1. New Libraries Required in Arduino IDE

To support the offline Captive Portal and Local HTTP Server, you must install the following libraries in the Arduino IDE (Go to **Sketch -> Include Library -> Manage Libraries**):

1. **`ESPAsyncWebServer`** (by me-no-dev)
   - *Note: This library often requires you to download it directly from GitHub as a `.zip` file if it doesn't appear in the Library Manager. (Go to GitHub -> me-no-dev/ESPAsyncWebServer -> Code -> Download ZIP).*
2. **`AsyncTCP`** (by me-no-dev)
   - *Note: Also install via GitHub ZIP if not in the Library Manager.*

---

## 2. Firmware Architecture Changes

The `esp32_firebot_wifi_standalone.ino` file will be modified to handle a **State Machine** for its network connection.

### Core Variables Added:
```cpp
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>

AsyncWebServer server(80);
DNSServer dnsServer;

bool isEmergencyMode = false;
unsigned long lastWiFiCheck = 0;
```

### The New `loop()` Logic:
Instead of just crashing if the WiFi router loses power, the ESP32 will constantly monitor the connection health.

```cpp
void loop() {
  // 1. Check WiFi Health every 10 seconds
  if (millis() - lastWiFiCheck > 10000) {
    if (WiFi.status() != WL_CONNECTED && !isEmergencyMode) {
      Serial.println("❌ WiFi Router Lost! Switching to Emergency AP Mode...");
      startEmergencyAPMode();
    }
    lastWiFiCheck = millis();
  }

  // 2. If in Emergency Mode, handle DNS requests for the Captive Portal
  if (isEmergencyMode) {
    dnsServer.processNextRequest();
  }

  // ... (Rest of existing fire detection logic)
}
```

### The `startEmergencyAPMode()` Function:
This function is triggered when the router dies. It turns the ESP32 into a WiFi router itself.

```cpp
void startEmergencyAPMode() {
  isEmergencyMode = true;
  
  // Create WiFi Network with the Bot's ID
  WiFi.mode(WIFI_AP);
  WiFi.softAP(BOT_ID.c_str(), ""); // No password for emergency access!
  
  // Start DNS Server to force all internet traffic to the ESP32 (Captive Portal)
  dnsServer.start(53, "*", WiFi.softAPIP());

  // Define the raw HTTP API for the React App to hit (if it was left open)
  server.on("/api/send-command", HTTP_POST, [](AsyncWebServerRequest *request){
    // Read command and move motors...
  });

  // Define the Barebones HTML page for the Captive Portal (if React App is closed)
  server.onNotFound([](AsyncWebServerRequest *request){
    request->send(200, "text/html", "<html>...Emergency Override Buttons...</html>");
  });

  server.begin();
}
```

---

## 3. Why This Works Perfectly

1. **If the user has the React App open:** They connect to `FIREBOT_001` in WiFi settings. They go back to the app, press "Emergency Override", and the app sends an HTTP `POST` to `/api/send-command` on the ESP32.
2. **If the user does NOT have the React App open:** They connect to `FIREBOT_001` in WiFi settings. The phone tries to reach `apple.com` or `google.com` to test for internet. The `DNSServer` intercepts this request and forces the phone to immediately display the `server.onNotFound` basic HTML page, granting them instant control without needing an app.
