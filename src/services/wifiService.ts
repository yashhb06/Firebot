class WifiService {
  private esp32Url: string = 'http://192.168.4.1';
  private statusInterval: number | null = null;
  private sensorCallback: ((data: any) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private isConnected: boolean = false;

  setEsp32Ip(ip: string) {
    this.esp32Url = `http://${ip}`;
  }

  async connect() {
    try {
      const response = await fetch(`${this.esp32Url}/api/connect`, { method: 'POST' });
      if (response.ok) {
        this.isConnected = true;
        this.notifyConnection(true);
        this.startStatusPolling();
      } else {
        throw new Error('Connection rejected');
      }
    } catch (e) {
      this.isConnected = false;
      this.notifyConnection(false);
      throw e;
    }
  }

  disconnect() {
    this.isConnected = false;
    this.notifyConnection(false);
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    fetch(`${this.esp32Url}/api/disconnect`, { method: 'POST' }).catch(() => {});
  }

  async sendCommand(command: string) {
    if (!this.isConnected) return;
    try {
      await fetch(`${this.esp32Url}/api/send-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }

  async setWiFi(ssid: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.esp32Url}/api/wifi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, password }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send WiFi credentials:', error);
      return false;
    }
  }

  private startStatusPolling() {
    if (this.statusInterval) clearInterval(this.statusInterval);
    
    // Poll the ESP32 every 2 seconds for sensor data
    this.statusInterval = window.setInterval(async () => {
      if (!this.isConnected) return;
      try {
        const response = await fetch(`${this.esp32Url}/api/status`);
        if (response.ok) {
          const data = await response.json();
          if (this.sensorCallback) {
            this.sensorCallback({
              fire: data.fireDetected,
              pump: data.pumpStatus,
              manualMode: data.manualMode,
            });
          }
        }
      } catch (e) {
        // Stop polling if we lose connection
        console.error('Connection lost during polling');
        this.disconnect();
      }
    }, 2000);
  }

  onSensorData(callback: (data: any) => void) {
    this.sensorCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallback = callback;
  }

  private notifyConnection(status: boolean) {
    if (this.connectionCallback) {
      this.connectionCallback(status);
    }
  }
}

export const websocketService = new WifiService(); // Exported as websocketService to minimize refactoring in AppWiFi.tsx
