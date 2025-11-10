/**
 * WiFi Service for FireBot
 * =========================
 * 
 * This service communicates directly with ESP32 via WiFi (no local server needed).
 * 
 * Communication Flow:
 * React App → HTTP → ESP32 (192.168.4.1) → I²C → Arduino Uno
 * 
 * Setup:
 * 1. Upload esp32_wifi_ap_bridge.ino to ESP32
 * 2. ESP32 creates WiFi network "FireBot-AP"
 * 3. Connect your computer to "FireBot-AP" WiFi
 * 4. React app connects to http://192.168.4.1
 */

export interface SensorData {
  fireDetected: boolean;
  pumpStatus: boolean;
}

export type Command = 'F' | 'B' | 'L' | 'R' | 'S' | 'P1' | 'P0' | 'AUTO' | 'EXTINGUISH';

class WiFiService {
  private esp32Url: string = 'http://192.168.4.1'; // ESP32 Access Point IP
  private connected: boolean = false;
  private statusInterval: number | null = null;
  private onSensorDataCallback: ((data: SensorData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private onModeChangeCallback: ((manualMode: boolean) => void) | null = null;

  /**
   * Connect to ESP32 via WiFi
   */
  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to ESP32 via WiFi...');
      
      // Skip health check and connect directly for speed
      // Use shorter timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.esp32Url}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Connection response:', data);

      if (data.success) {
        this.connected = true;
        console.log('✅ Connected to ESP32 FireBot via WiFi');
        
        // Start polling for sensor data
        this.startStatusPolling();
        
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }
      } else {
        throw new Error(data.message || 'Connection failed');
      }

    } catch (error: any) {
      console.error('❌ WiFi connection failed:', error.message);
      
      // Check if ESP32 is reachable
      if (error.message.includes('fetch')) {
        throw new Error('Cannot reach ESP32. Make sure you are connected to "FireBot-AP" WiFi network.');
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from ESP32
   */
  async disconnect(): Promise<void> {
    try {
      // Stop status polling
      this.stopStatusPolling();
      
      const response = await fetch(`${this.esp32Url}/api/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        this.connected = false;
        console.log('🔌 Disconnected from ESP32 FireBot');
        
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
      }

    } catch (error) {
      console.error('❌ Disconnect failed:', error);
    }
  }

  /**
   * Send command to ESP32
   */
  async sendCommand(command: Command | string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to FireBot');
    }

    try {
      const response = await fetch(`${this.esp32Url}/api/send-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error('Failed to send command');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Command failed');
      }

      console.log(`📤 Command sent: ${command}`);

    } catch (error: any) {
      console.error('❌ Failed to send command:', error.message);
      throw error;
    }
  }

  /**
   * Get current robot status
   */
  async getStatus(): Promise<{ connected: boolean; sensorData: SensorData; manualMode: boolean }> {
    try {
      const response = await fetch(`${this.esp32Url}/api/status`);
      
      if (!response.ok) {
        throw new Error('Failed to get status');
      }

      const data = await response.json();
      return {
        connected: data.connected || false,
        sensorData: data.sensorData || { fireDetected: false, pumpStatus: false },
        manualMode: data.manualMode || false
      };

    } catch (error) {
      console.error('❌ Failed to get status:', error);
      return {
        connected: false,
        sensorData: {
          fireDetected: false,
          pumpStatus: false
        },
        manualMode: false
      };
    }
  }

  /**
   * Check if ESP32 is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.esp32Url}/api/health`, {
        method: 'GET'
      });

      return response.ok;

    } catch (error) {
      return false;
    }
  }

  /**
   * Start polling for sensor data
   */
  private startStatusPolling(): void {
    // Poll every 500ms
    this.statusInterval = window.setInterval(async () => {
      if (this.connected) {
        try {
          const status = await this.getStatus();
          
          if (this.onSensorDataCallback && status.sensorData) {
            this.onSensorDataCallback(status.sensorData);
          }
          
          if (this.onModeChangeCallback !== null) {
            this.onModeChangeCallback(status.manualMode);
          }
        } catch (error) {
          console.error('Status polling error:', error);
          // Don't disconnect on single polling error
        }
      }
    }, 500);
  }

  /**
   * Stop polling for sensor data
   */
  private stopStatusPolling(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  /**
   * Register callback for sensor data updates
   */
  onSensorData(callback: (data: SensorData) => void): void {
    this.onSensorDataCallback = callback;
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Register callback for mode changes
   */
  onModeChange(callback: (manualMode: boolean) => void): void {
    this.onModeChangeCallback = callback;
  }

  /**
   * Check if connected to ESP32
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get device name (for compatibility)
   */
  getDeviceName(): string {
    return 'FireBot';
  }

  /**
   * Get ESP32 IP address
   */
  getESP32IP(): string {
    return this.esp32Url;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopStatusPolling();
    this.connected = false;
  }
}

// Export singleton instance
export const wifiService = new WiFiService();
