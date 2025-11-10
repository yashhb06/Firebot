import { useState, useEffect } from 'react';
import { HeaderWiFi } from './components/HeaderWiFi';
import { ControlPanelWiFi } from './components/ControlPanelWiFi';
import { StatusPanelWiFi } from './components/StatusPanelWiFi';
import { wifiService } from './services/wifiService';

interface SensorData {
  fire: boolean;
  pump: boolean;
}

function AppWiFi() {
  const [isConnected, setIsConnected] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('192.168.4.1');
  const [isManualMode, setIsManualMode] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    fire: false,
    pump: false,
  });

  // Simulate sensor data when not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setSensorData({
          fire: Math.random() > 0.7, // Random fire detection for testing
          pump: false,
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Set up WiFi service callbacks
  useEffect(() => {
    wifiService.onSensorData((data) => {
      setSensorData({
        fire: data.fireDetected,
        pump: data.pumpStatus
      });
    });

    wifiService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
    });

    wifiService.onModeChange((manualMode: boolean) => {
      setIsManualMode(manualMode);
    });
  }, []);

  const handleConnect = async (ip: string) => {
    try {
      setEsp32Ip(ip);
      await wifiService.connect();
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect to ESP32 at ${ip}. Make sure you are connected to FireBot-AP WiFi network.`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await wifiService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const handleCommand = async (command: string) => {
    if (!isConnected) {
      alert('Please connect to the robot first!');
      return;
    }

    try {
      await wifiService.sendCommand(command as any);
      
      // Update pump status locally for immediate feedback
      if (command === 'P1') {
        setSensorData(prev => ({ ...prev, pump: true }));
      } else if (command === 'P0') {
        setSensorData(prev => ({ ...prev, pump: false }));
      } else if (command === 'AUTO') {
        setIsManualMode(false);
      }
    } catch (error) {
      console.error('Command error:', error);
      alert('Failed to send command to robot. Connection may be lost.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <HeaderWiFi
        isConnected={isConnected}
        esp32Ip={esp32Ip}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ControlPanelWiFi
            onCommand={handleCommand}
            pumpStatus={sensorData.pump}
            disabled={!isConnected}
            isManualMode={isManualMode}
          />
          <StatusPanelWiFi 
            sensorData={sensorData} 
            isConnected={isConnected}
            isManualMode={isManualMode}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">1.</span>
              <span>
                Make sure your ESP32 FireBot is powered on and connected to Wi-Fi.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">2.</span>
              <span>
                Click <strong>"Connect to Bot"</strong>, enter the ESP32's IP address (default: 192.168.4.1), and click Connect.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">3.</span>
              <span>
                Use the <strong>arrow buttons</strong> to control movement (Forward, Backward, Left, Right).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">4.</span>
              <span>
                Press the <strong>Stop button</strong> (red square) to halt all movement.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">5.</span>
              <span>
                Toggle the <strong>Pump Control</strong> to activate/deactivate the water pump.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">6.</span>
              <span>
                Monitor the <strong>Status Panel</strong> for real-time fire detection and pump status.
              </span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Network Setup:</strong> Make sure your computer and ESP32 are on the same Wi-Fi network. 
              If using ESP32 Access Point mode, connect to the "FireBot" Wi-Fi network first.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Finding ESP32 IP:</strong> Check your router's connected devices or use the Serial Monitor 
              in Arduino IDE to see the IP address printed on startup.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-gray-600">
        <p>FireBot Controller v2.0 (Wi-Fi) | Built with React + WebSocket</p>
      </footer>
    </div>
  );
}

export default AppWiFi;
