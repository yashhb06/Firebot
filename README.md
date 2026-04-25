# FireBot Emergency Control System Architecture

This document outlines the complete architectural plan and the specific changes made to both the ESP32 firmware and the React frontend to support a robust, dual-mode operation for the FireBot system.

## 1. System Overview

The goal of this project is to create a resilient, cloud-connected FireBot that remains fully functional even during total power and internet outages. To achieve this, we transitioned from a purely cloud-dependent system to a **Dual-Mode Architecture**:

1. **Cloud Mode (Primary):** The ESP32 connects to the home WiFi and communicates with the React frontend via Firebase Realtime Database.
2. **Local Emergency Mode (Fallback):** If the home WiFi or internet goes down, the ESP32 automatically creates its own local WiFi Access Point (AP). The React frontend can then connect directly to this AP and control the bot via a Local HTTP API.

---

## 2. ESP32 Firmware Changes

The ESP32 firmware was heavily modified to support dynamic network switching, credential management, and dual communication protocols.

### Key Features Implemented:
* **Smart WiFi Provisioning (Captive Portal):** Removed hardcoded WiFi credentials. The ESP32 now boots into AP mode (e.g., "FireBot-Setup") on first boot or when it fails to connect to known networks. Users can connect to this network and enter their home WiFi credentials via a simple web page.
* **Auto-Fallback Mechanism:** The firmware continuously monitors the WiFi connection. If the connection drops or Firebase is unreachable for an extended period, it automatically falls back to broadcasting its own Emergency AP ("FireBot-Emergency").
* **Local HTTP API:** Implemented an asynchronous web server directly on the ESP32. This API accepts direct HTTP POST requests (e.g., `/api/control`) from the frontend when in Local Emergency Mode, bypassing the need for an external internet connection.
* **Firebase Integration (Cloud):** Maintained and optimized the Firebase Realtime Database connection for normal operation, allowing remote control from anywhere in the world when internet is available.

---

## 3. React Frontend Changes

The React web application was updated to seamlessly handle both connection modes and provide a clear UI for the end-user.

### Key Features Implemented:
* **Dual-Mode Networking Service:** Refactored the `apiService.ts` and control logic. The app now checks the current operation mode:
  * In **Cloud Mode**, it sends control commands (up, down, left, right, payload drop, water pump) over the internet to the Firebase Realtime Database.
  * In **Local Mode**, it sends HTTP POST requests directly to the ESP32's local IP address (e.g., `192.168.4.1`).
* **Connection Toggle UI ($OwnerDashboard.tsx$):** Added UI elements to clearly indicate the current connection status (Cloud vs. Local Override). Included a toggle allowing the user to explicitly force the app into "Local Override" mode if they connect their device directly to the ESP32's emergency WiFi.
* **Graceful Degradation:** The UI gracefully handles connection timeouts and guides the user on how to switch to the local emergency network if the cloud connection is lost.
* **Unified Control Interface:** Despite having two entirely different backend communication methods, the user-facing control interface (joysticks, buttons) remains exactly the same, abstracting the complexity away from the operator.
