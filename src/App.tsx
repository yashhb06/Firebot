import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { StatusPanel } from './components/StatusPanel';
import { wifiService, type SensorData } from './services/wifiService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [sensorData, setSensorData] = useState<SensorData>({
    fireDetected: false,
    pumpStatus: false,
  });

  // Simulate sensor data when not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setSensorData({
          fireDetected: Math.random() > 0.8,
          pumpStatus: false,
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Set up sensor data callback
  useEffect(() => {
    wifiService.onSensorData((data: SensorData) => {
      setSensorData(data);
    });
    
    wifiService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
    });
  }, []);

  const handleConnect = async () => {
    console.log('🔘 Connect button clicked');
    
    // Show immediate feedback
    setIsConnecting(true);
    
    try {
      console.log('🔄 Starting connection process...');
      await wifiService.connect();
      setIsConnected(true);
      setDeviceName(wifiService.getDeviceName());
      console.log('✅ Connection successful!');
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      
      let errorMessage = 'Failed to connect to FireBot.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AbortError') {
        errorMessage = 'Cannot reach ESP32. Please check:\n\n1. Are you connected to "FireBot-AP" WiFi?\n2. Is ESP32 powered on and running?\n3. Try opening http://192.168.4.1 in browser first.';
      } else if (error.message.includes('ESP32 not reachable')) {
        errorMessage = error.message + '\n\nSteps to fix:\n1. Connect to "FireBot-AP" WiFi network\n2. Password: firebot123\n3. Test by opening http://192.168.4.1';
      } else {
        errorMessage = `Connection failed: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await wifiService.disconnect();
      setIsConnected(false);
      setDeviceName('');
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
      await wifiService.sendCommand(command);
      
      // Update pump status locally for immediate feedback
      if (command === 'P1') {
        setSensorData(prev => ({ ...prev, pumpStatus: true }));
      } else if (command === 'P0') {
        setSensorData(prev => ({ ...prev, pumpStatus: false }));
      }
    } catch (error) {
      console.error('Command error:', error);
      alert('Failed to send command to robot.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        isConnected={isConnected}
        isConnecting={isConnecting}
        deviceName={deviceName}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ControlPanel
            onCommand={handleCommand}
            pumpStatus={sensorData.pumpStatus}
            disabled={!isConnected}
          />
          <StatusPanel sensorData={sensorData} isConnected={isConnected} />
        </div>

        {/* Connection Message */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Connect to "FireBot-AP" WiFi network, then click "Connect to Robot" to enable controls.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
