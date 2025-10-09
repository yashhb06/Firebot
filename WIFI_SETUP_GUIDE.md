# 📶 FireBot WiFi Setup Guide

## Complete WiFi Connection Solution

This guide shows you how to connect your FireBot via **WiFi** instead of Bluetooth or local server.

---

## 🎯 **How WiFi Mode Works**

```
Your Computer (WiFi) → ESP32 Access Point (192.168.4.1) → I²C → Arduino Uno
```

### **Benefits of WiFi Mode:**
✅ **No server needed** - Direct connection to ESP32  
✅ **Works on all devices** - Phones, tablets, laptops  
✅ **Better range** - Up to 50+ meters  
✅ **Multiple connections** - Several devices can connect  
✅ **Simple setup** - Just connect to WiFi network  

---

## 🚀 **Quick Setup (4 Steps)**

### **Step 1: Upload ESP32 WiFi Code**

1. **Open Arduino IDE**

2. **Open the WiFi code:**
   - File → Open
   - Navigate to your project folder
   - Select: `esp32_wifi_ap_bridge.ino`

3. **Select ESP32 board:**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

4. **Select COM port:**
   - Tools → Port → COM X (your ESP32 USB port)

5. **Upload the code:**
   - Click Upload button (→)
   - Wait for "Done uploading"

6. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate: **115200**

7. **Verify upload success:**
   ```
   ========================================
   ESP32 WiFi Access Point Bridge for FireBot
   ========================================
   ✅ I²C Master initialized
   ✅ Arduino Uno detected on I²C bus!
   ✅ WiFi Access Point started!
      SSID: FireBot-AP
      Password: firebot123
      IP Address: 192.168.4.1
   
   📱 Connect your computer to WiFi:
      1. Open WiFi settings
      2. Connect to: FireBot-AP
      3. Enter password: firebot123
      4. Open browser to: http://192.168.4.1
   ========================================
   🤖 FireBot Ready!
   ========================================
   ```

---

### **Step 2: Connect to ESP32 WiFi Network**

1. **Open WiFi settings on your computer:**
   - Windows: Click WiFi icon in taskbar
   - Mac: Click WiFi icon in menu bar

2. **Look for "FireBot-AP" network:**
   - It should appear in the available networks list
   - If not visible, wait 30 seconds and refresh

3. **Connect to "FireBot-AP":**
   - Click on "FireBot-AP"
   - Enter password: **`firebot123`**
   - Click Connect

4. **Verify connection:**
   - You should see "Connected" next to FireBot-AP
   - Your computer is now on ESP32's network

---

### **Step 3: Test ESP32 Connection**

1. **Open web browser**

2. **Go to ESP32 IP address:**
   ```
   http://192.168.4.1
   ```

3. **You should see:**
   ```
   FireBot ESP32 WiFi Bridge
   Status: Running
   IP: 192.168.4.1
   Connected Clients: 1
   
   API Endpoints:
   • GET /api/health - Health check
   • POST /api/connect - Connect to robot
   • POST /api/send-command - Send command
   • GET /api/status - Get status
   ```

4. **If this works, ESP32 is ready!** ✅

---

### **Step 4: Start React App**

1. **Open Command Prompt/Terminal**

2. **Navigate to project folder:**
   ```cmd
   cd C:\path\to\firebot-controller
   ```

3. **Start React app:**
   ```cmd
   npm run dev
   ```

4. **Open browser to:**
   ```
   http://localhost:5173
   ```

5. **Click "Connect to Robot"**

6. **You should see:**
   - "Connected to FireBot" ✅ (green indicator)
   - All control buttons enabled
   - Real-time status updates

---

## 🎮 **Using WiFi Mode**

### **Manual Control:**
- ⬆️ **Forward** - Robot moves forward
- ⬇️ **Backward** - Robot moves backward  
- ⬅️ **Left** - Robot turns left
- ➡️ **Right** - Robot turns right
- ⏹️ **Stop** - Robot stops all movement
- 💧 **Pump Toggle** - Turn water pump on/off

### **Auto Mode:**
- 🔄 **Toggle Switch** - Switch between Manual/Auto
- 🔥 **Auto Mode** - Robot automatically seeks and extinguishes fires
- Manual controls disabled in Auto mode

### **Status Display:**
- 🔥 **Fire Detection** - Shows if fire is detected
- 💧 **Pump Status** - Shows if pump is active
- 📡 **Connection Status** - Shows WiFi connection status

---

## 🔧 **WiFi Network Details**

| Setting | Value |
|---------|-------|
| **Network Name (SSID)** | FireBot-AP |
| **Password** | firebot123 |
| **ESP32 IP Address** | 192.168.4.1 |
| **Network Type** | WPA2 Personal |
| **Channel** | Auto |
| **Max Clients** | 4 devices |

---

## 📱 **Multi-Device Support**

**You can connect multiple devices to FireBot-AP:**
- 💻 Laptop running React app
- 📱 Phone/tablet for monitoring
- 🖥️ Another computer for debugging
- 📊 All devices can access http://192.168.4.1

---

## 🔍 **Troubleshooting**

### **Problem 1: "FireBot-AP" network not visible**

**Solutions:**
1. **Check ESP32 Serial Monitor:**
   - Should show "WiFi Access Point started!"
   - If not, re-upload the code

2. **Reset ESP32:**
   - Press reset button on ESP32
   - Wait 30 seconds
   - Check WiFi networks again

3. **Move closer to ESP32:**
   - WiFi range is about 50 meters
   - Walls and obstacles reduce range

---

### **Problem 2: Can connect to WiFi but can't reach 192.168.4.1**

**Solutions:**
1. **Check IP address:**
   - ESP32 Serial Monitor shows actual IP
   - Should be 192.168.4.1

2. **Disable other network connections:**
   - Turn off mobile data
   - Disconnect from other WiFi networks
   - Only connect to FireBot-AP

3. **Clear browser cache:**
   - Press Ctrl+F5 to hard refresh
   - Try different browser

4. **Check firewall:**
   - Windows Firewall might block connection
   - Temporarily disable firewall to test

---

### **Problem 3: React app says "Cannot reach ESP32"**

**Solutions:**
1. **Verify WiFi connection:**
   - Make sure you're connected to "FireBot-AP"
   - Not your home WiFi or mobile hotspot

2. **Test ESP32 directly:**
   - Open browser to http://192.168.4.1
   - Should show ESP32 status page

3. **Check React app URL:**
   - Should be http://localhost:5173
   - Not localhost:5000 (that's for server mode)

4. **Restart React app:**
   - Press Ctrl+C in terminal
   - Run `npm run dev` again

---

### **Problem 4: Commands not working**

**Solutions:**
1. **Check ESP32 Serial Monitor:**
   - Should show "Received command: F" when you click Forward
   - Should show "Sent 'F' to Arduino"

2. **Check I²C connection:**
   - ESP32 GPIO21 → Arduino A4 (SDA)
   - ESP32 GPIO22 → Arduino A5 (SCL)  
   - Common Ground connected

3. **Verify Arduino code:**
   - Arduino should have `arduino_uno_firebot_slave.ino` uploaded
   - Arduino Serial Monitor (9600 baud) should show I²C activity

---

## 📊 **Expected Behavior**

### **ESP32 Serial Monitor (115200 baud):**
```
✅ WiFi Access Point started!
📱 Client connected
📨 Received command: {"command":"F"}
   Command: F
   → Sent 'F' (Forward) to Arduino
```

### **Arduino Serial Monitor (9600 baud):**
```
📨 Received: F
⬆️  Moving Forward
📤 Sent Status - Fire: 0, Pump: 0
```

### **React App Browser:**
```
Connected to FireBot ✅
Fire Detection: Safe (green)
Water Pump: Standby
```

---

## 🔄 **Switching Between Modes**

### **From Bluetooth/Server to WiFi:**
1. Upload `esp32_wifi_ap_bridge.ino` to ESP32
2. Connect to "FireBot-AP" WiFi
3. React app automatically uses WiFi service
4. No server needed!

### **From WiFi back to Bluetooth:**
1. Upload `esp32_bluetooth_serial_bridge.ino` to ESP32
2. Update App.tsx to use `localServerService`
3. Start local server
4. Pair ESP32 in Bluetooth settings

---

## 💡 **Pro Tips**

### **For Best Performance:**
- Keep ESP32 within 30 meters
- Avoid obstacles between devices and ESP32
- Use 5GHz WiFi on your router (ESP32 uses 2.4GHz, no interference)
- Position ESP32 antenna vertically

### **For Development:**
- Keep ESP32 Serial Monitor open for debugging
- Use browser developer tools (F12) to see network requests
- Test commands individually before using auto mode

### **For Demos:**
- ESP32 creates its own network - no internet needed
- Multiple people can connect and watch
- Works great for presentations and showcases

---

## 📋 **Quick Reference**

### **WiFi Credentials:**
```
SSID: FireBot-AP
Password: firebot123
```

### **ESP32 URLs:**
```
Status Page: http://192.168.4.1
Health Check: http://192.168.4.1/api/health
```

### **React App:**
```
Local: http://localhost:5173
```

### **Commands:**
```
F - Forward    |  P1 - Pump ON
B - Backward   |  P0 - Pump OFF  
L - Left       |  S - Stop
R - Right      |  EXTINGUISH - Auto mode
```

---

## ✅ **Setup Checklist**

- [ ] ESP32 has `esp32_wifi_ap_bridge.ino` uploaded
- [ ] ESP32 Serial Monitor shows "WiFi Access Point started!"
- [ ] "FireBot-AP" appears in WiFi networks
- [ ] Connected to "FireBot-AP" with password "firebot123"
- [ ] Browser can access http://192.168.4.1
- [ ] React app starts with `npm run dev`
- [ ] React app shows "Connected to FireBot" ✅
- [ ] Control buttons work (Forward, Stop, etc.)
- [ ] Status panel updates in real-time

---

## 🎉 **You're All Set!**

Your FireBot now uses **WiFi connection** for:
- ✅ **Wireless control** from any device
- ✅ **Better range** than Bluetooth  
- ✅ **No server required** - direct ESP32 connection
- ✅ **Multi-device support** - phones, tablets, laptops
- ✅ **Easy setup** - just connect to WiFi network

**Start controlling your fire-fighting robot via WiFi!** 📶🔥🤖

---

*Built with ❤️ by Strawhat Crew 🏴‍☠️*
