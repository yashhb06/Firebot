# 🔥 FireBot Controller

A React web application for controlling a fire-extinguishing robot via WiFi.

## Features

- **WiFi Control**: Direct robot control via ESP32 WiFi hotspot
- **Autonomous Mode**: Intelligent fire detection and extinguishing  
- **Manual Control**: Full manual control of movement and pump
- **Real-time Status**: Live sensor data and robot status
- **Modern UI**: Dark theme with responsive design

## Setup Steps

### **Step 1: Upload ESP32 Code**
1. Open **Arduino IDE**
2. Open file: `esp32_firebot_wifi_standalone.ino`
3. Select board: **Tools → Board → ESP32 Dev Module**
4. Select port: **Tools → Port → COM X** (your ESP32 port)
5. Click **Upload** button
6. Open **Serial Monitor** (115200 baud)
7. Verify output shows: `✅ WiFi Access Point started!`

### **Step 2: Connect to ESP32 WiFi**
1. Open **WiFi settings** on your laptop
2. Look for **"FireBot-AP"** network
3. Connect with password: **`firebot123`**
4. Test connection: Open browser → `http://192.168.4.1`
5. Should show: **"FireBot ESP32 WiFi Bridge"** status page

### **Step 3: Setup React App**
1. Open **terminal/command prompt**
2. Navigate to project folder:
   ```cmd
   cd C:\path\to\firebot-controller
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Start React app:
   ```cmd
   npm run dev
   ```
5. Open browser: **`http://localhost:5173`**

### **Step 4: Connect and Control**
1. Click **"Connect to Robot"** button (WiFi icon)
2. Should show: **"Connected to FireBot"** ✅
3. **Manual Mode**: Use arrow buttons (⬆️⬇️⬅️➡️), stop (⏹️), pump (💧)
4. **Auto Mode**: Toggle switch to activate autonomous fire-fighting

## Controls

### Manual Mode
- ⬆️⬇️⬅️➡️ **Movement**: Directional control
- ⏹️ **Stop**: Emergency stop
- 💧 **Pump**: Toggle water pump

### Auto Mode  
- 🔄 **Toggle**: Switch to autonomous fire-fighting
- Robot automatically detects and extinguishes fires

## How It Works

```
Laptop (React App) → WiFi → ESP32 (192.168.4.1) → FireBot Hardware
```

## Files

- `esp32_firebot_wifi_standalone.ino` - ESP32 WiFi controller code
- `src/services/wifiService.ts` - WiFi communication service
- `src/components/` - React UI components
- `SETUP_GUIDE.md` - Detailed setup instructions

## Requirements

- ESP32 with WiFi capability
- Fire detection sensors
- Water pump and servo motor  
- Motor driver for movement

---

**Simple WiFi setup - No servers, no Bluetooth, no complications!** 🔥🤖
