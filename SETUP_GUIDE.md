# 🔥 FireBot WiFi Setup Guide

## Simple WiFi Connection for Laptop Control

This guide shows you how to control your FireBot via WiFi from your laptop.

---

## 🎯 **How It Works**

```
Your Laptop (WiFi) → ESP32 Access Point (192.168.4.1) → FireBot Hardware
```

**Benefits:**
- ✅ No server needed - Direct connection to ESP32
- ✅ No Bluetooth pairing required
- ✅ Better range than Bluetooth
- ✅ Works on all browsers

---

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Upload ESP32 Code**

1. **Open Arduino IDE**
2. **Open:** `esp32_firebot_wifi_standalone.ino`
3. **Select ESP32 board:** Tools → Board → ESP32 Dev Module
4. **Select COM port:** Tools → Port → COM X
5. **Upload** the code
6. **Open Serial Monitor** (115200 baud)
7. **Verify success:**
   ```
   ✅ WiFi Access Point started!
      SSID: FireBot-AP
      Password: firebot123
      IP Address: 192.168.4.1
   🤖 FireBot Ready - Auto Mode Active
   ```

### **Step 2: Connect Laptop to ESP32 WiFi**

1. **Open WiFi settings** on your laptop
2. **Connect to "FireBot-AP"**
3. **Enter password:** `firebot123`
4. **Test connection:** Open browser → `http://192.168.4.1`
5. **Should see:** ESP32 status page

### **Step 3: Start React App**

1. **Open terminal/command prompt**
2. **Navigate to project:**
   ```cmd
   cd C:\path\to\firebot-controller
   ```
3. **Start React app:**
   ```cmd
   npm run dev
   ```
4. **Open browser:** `http://localhost:5173`
5. **Click "Connect to Robot"**
6. **Start controlling!** 🎮

---

## 🎮 **Controls**

### **Manual Mode (Default):**
- ⬆️ **Forward** - Move forward
- ⬇️ **Backward** - Move backward
- ⬅️ **Left** - Turn left
- ➡️ **Right** - Turn right
- ⏹️ **Stop** - Stop all movement
- 💧 **Pump** - Toggle water pump

### **Auto Mode:**
- 🔄 **Toggle Switch** - Switch to autonomous mode
- Robot automatically detects and extinguishes fires
- Manual controls disabled in auto mode

---

## 📊 **Status Display**

- 🔥 **Fire Detection** - Shows if fire sensors detect fire
- 💧 **Pump Status** - Shows if water pump is active
- 📡 **Connection Status** - Shows WiFi connection status

---

## 🔧 **WiFi Network Details**

| Setting | Value |
|---------|-------|
| **Network Name** | FireBot-AP |
| **Password** | firebot123 |
| **ESP32 IP** | 192.168.4.1 |
| **React App** | http://localhost:5173 |

---

## 🔍 **Troubleshooting**

### **Problem: "FireBot-AP" not visible**
- Check ESP32 Serial Monitor shows "WiFi Access Point started!"
- Press ESP32 reset button and wait 30 seconds
- Move closer to ESP32

### **Problem: Can't access 192.168.4.1**
- Make sure you're connected to "FireBot-AP" (not your home WiFi)
- Try different browser
- Check firewall settings

### **Problem: React app won't connect**
- Verify you can access http://192.168.4.1 first
- Make sure React app is running on http://localhost:5173
- Check browser console for errors (F12)

### **Problem: Commands not working**
- Check ESP32 Serial Monitor for "Received command" messages
- Verify fire sensors and motors are connected properly
- Try switching between Manual and Auto modes

---

## 📁 **Project Structure (Clean)**

```
firebot-controller/
├── esp32_firebot_wifi_standalone.ino  ← ESP32 code (upload this)
├── src/
│   ├── components/                     ← React UI components
│   ├── services/
│   │   └── wifiService.ts             ← WiFi communication
│   └── App.tsx                        ← Main app
├── package.json                       ← Dependencies
├── README.md                          ← Basic info
├── WIFI_SETUP_GUIDE.md               ← Detailed setup
└── SETUP_GUIDE.md                    ← This file
```

---

## ✅ **Quick Checklist**

- [ ] ESP32 code uploaded successfully
- [ ] Serial Monitor shows "WiFi Access Point started!"
- [ ] Laptop connected to "FireBot-AP" WiFi
- [ ] Browser can access http://192.168.4.1
- [ ] React app running on http://localhost:5173
- [ ] "Connect to Robot" shows success
- [ ] Control buttons work

---

## 🎉 **You're Ready!**

Your FireBot is now controllable via WiFi from your laptop:

1. **Upload ESP32 code** → Creates WiFi hotspot
2. **Connect to "FireBot-AP"** → Join robot's network  
3. **Run React app** → Control interface
4. **Control robot** → Manual or autonomous mode

**Happy robot controlling!** 🔥🤖

---

*Simple WiFi setup - No servers, no Bluetooth, no complications!*
