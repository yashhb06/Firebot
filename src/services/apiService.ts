/**
 * Emergency Offline Local API Service
 * 
 * Used ONLY when the internet is down and the user's phone is directly
 * connected to the ESP32's "FIREBOT_001" Access Point WiFi network.
 */
export const apiService = {
  // The default IP address of the ESP32 when acting as an Access Point
  baseUrl: 'http://192.168.4.1',

  /**
   * Send a command directly to the ESP32 over local HTTP
   */
  async sendCommand(command: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/send-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=${command}`,
        // Short timeout because if it's not connected locally, it will hang
        signal: AbortSignal.timeout(3000)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send local command. Are you connected to the ESP32 WiFi?', error);
      return false;
    }
  },

  /**
   * Attempt a quick ping to see if we are connected to the ESP32 locally
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Just try submitting an invalid/safe command or a specific ping route.
      // Easiest is just waiting for fetch to timeout or succeed.
      const response = await fetch(`${this.baseUrl}/api/send-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=PING`,
        signal: AbortSignal.timeout(1500)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
