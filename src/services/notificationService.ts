/** Request browser notification permission */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

/** Show a system notification for fire events */
export const showFireNotification = (type: 'detected' | 'suppressed'): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const isDetected = type === 'detected';
  const n = new Notification(
    isDetected ? '🔥 FIRE DETECTED — FireBot Responding!' : '✅ Fire Extinguished by FireBot',
    {
      body: isDetected
        ? 'FireBot has detected a fire and is autonomously responding!'
        : 'FireBot has successfully suppressed the fire. Area is now safe.',
      icon: '/favicon.ico',
      tag: `firebot-${type}`,
      requireInteraction: isDetected,
    }
  );
  n.onclick = () => { window.focus(); n.close(); };
};
