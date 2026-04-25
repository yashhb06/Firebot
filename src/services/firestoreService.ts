import {
  collection, addDoc, onSnapshot, query,
  orderBy, limit, updateDoc, doc, Timestamp, where, getDoc, setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface FireEvent {
  id?: string;
  type: 'detected' | 'suppressed';
  timestamp: Date;
  read: boolean;
}

/** Add a new fire event (called when sensor state changes) */
export const addFireEvent = async (type: 'detected' | 'suppressed'): Promise<void> => {
  await addDoc(collection(db, 'fire_events'), {
    type,
    timestamp: Timestamp.now(),
    read: false,
  });
};

/** Real-time listener for recent fire events */
export const subscribeToFireEvents = (
  callback: (events: FireEvent[]) => void,
  limitCount = 20
): (() => void) => {
  const q = query(
    collection(db, 'fire_events'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        type: d.data().type as 'detected' | 'suppressed',
        timestamp: d.data().timestamp?.toDate?.() ?? new Date(),
        read: d.data().read ?? false,
      }))
    );
  });
};

/** Count of unread events (live) */
export const subscribeToUnreadCount = (cb: (n: number) => void): (() => void) => {
  const q = query(collection(db, 'fire_events'), where('read', '==', false));
  return onSnapshot(q, (snap) => cb(snap.size));
};

/** Mark one event as read */
export const markEventRead = async (id: string): Promise<void> => {
  await updateDoc(doc(db, 'fire_events', id), { read: true });
};

/** Mark all supplied events as read */
export const markAllRead = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => markEventRead(id)));
};

/** Get the saved ESP32 IP address from Firestore */
export const getSavedESP32IP = async (): Promise<string | null> => {
  try {
    const docRef = doc(db, 'firebot_config', 'network');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().ipAddress;
    }
    return null;
  } catch (error) {
    console.error("Error reading IP from Firestore", error);
    return null;
  }
};

/** Save the ESP32 IP address to Firestore (Owner only) */
export const saveESP32IP = async (ipAddress: string): Promise<void> => {
  try {
    const docRef = doc(db, 'firebot_config', 'network');
    // We use setDoc with merge so it creates the document if it doesn't exist
    await setDoc(docRef, { ipAddress }, { merge: true });
  } catch (error) {
    console.error("Error saving IP to Firestore", error);
  }
};
