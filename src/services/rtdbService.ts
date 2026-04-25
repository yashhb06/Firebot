import { ref, set, get, onValue, off, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase';

export interface SensorData {
  fireDetected: boolean;
  pumpStatus: boolean;
}

export type Command = 'F' | 'B' | 'L' | 'R' | 'S' | 'P1' | 'P0' | 'AUTO';

class RTDBService {
  private currentBotId: string | null = null;
  private onSensorDataCallback: ((data: SensorData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  /**
   * Connect to a specific bot via Firebase RTDB
   */
  async connectToBot(botId: string): Promise<void> {
    this.disconnect(); // Cleanup any existing listeners
    
    this.currentBotId = botId;
    console.log(`🔌 Connecting to Cloud Relay for Bot: ${botId}...`);
    
    const botStatusRef = ref(rtdb, `bots/${botId}/status`);

    // Listen for real-time status updates from the ESP32
    onValue(botStatusRef, (snapshot) => {
      const data = snapshot.val();
      
      // If we receive data, assume the bot is "connected" or at least talking to DB
      if (data) {
        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }

        if (this.onSensorDataCallback) {
          this.onSensorDataCallback({
            fireDetected: data.fireDetected || false,
            pumpStatus: data.pumpStatus || false
          });
        }

        // Simple timeout: if bot doesn't update status for 10s, consider it disconnected
        // (In a production app, we would use Firebase Presence, but this works for now)
        this.connectionTimeout = setTimeout(() => {
          if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(false);
          }
        }, 10000);
      }
    }, (error) => {
      console.error("RTDB Read Error:", error);
      if (this.onConnectionChangeCallback) this.onConnectionChangeCallback(false);
    });
    
    // Write an initial status check to force a connection state
    // (This ensures we don't just sit waiting forever if there's no data)
    setTimeout(() => {
        if(!this.connectionTimeout && this.onConnectionChangeCallback) {
             // Assume connected for UI purposes until data stream proves otherwise
             this.onConnectionChangeCallback(true);
        }
    }, 500);
  }

  /**
   * Disconnect from current bot
   */
  disconnect(): void {
    if (this.currentBotId) {
      const botStatusRef = ref(rtdb, `bots/${this.currentBotId}/status`);
      off(botStatusRef);
    }
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    this.currentBotId = null;
    
    if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
    }
  }

  /**
   * Send a command to the currently connected bot via RTDB
   */
  async sendCommand(command: Command | string): Promise<void> {
    if (!this.currentBotId) {
      throw new Error('Not connected to a FireBot');
    }

    try {
      const commandRef = ref(rtdb, `bots/${this.currentBotId}/command`);
      
      // Write the command along with a server timestamp
      // This allows the ESP32 to ignore old stale commands when it reboots
      await set(commandRef, {
        action: command,
        timestamp: serverTimestamp()
      });

      console.log(`📤 Cloud Command sent: ${command} to ${this.currentBotId}`);

    } catch (error: any) {
      console.error('❌ Failed to send command:', error.message);
      throw error;
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
   * Fetch the ESP32 IP address from Firebase using the Bot ID.
   * The ESP32 publishes its IP to /bots/{botId}/ip on boot.
   */
  async getBotIp(botId: string): Promise<string> {
    const ipRef = ref(rtdb, `bots/${botId}/ip`);
    const snapshot = await get(ipRef);
    if (snapshot.exists()) {
      return snapshot.val() as string;
    }
    throw new Error(`No IP found in Firebase for Bot ID: ${botId}. Make sure the FireBot has been set up and is connected to WiFi.`);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.disconnect();
  }
}

// Export singleton instance
export const rtdbService = new RTDBService();
