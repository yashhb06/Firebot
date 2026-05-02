import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  role: 'owner' | 'guest';
  email?: string;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private authStateListeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch or create user profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            this.currentUser = userDocSnap.data() as UserProfile;
          } else {
            // New user, determine role based on auth method
            const role = user.isAnonymous ? 'guest' : 'owner';
            const newProfile: UserProfile = {
              uid: user.uid,
              role,
              email: user.email || undefined
            };

            // Note: In a real app, assigning 'owner' role simply based on non-anonymous
            // might be insecure depending on setup, but works for this personal project.
            await setDoc(userDocRef, newProfile);
            this.currentUser = newProfile;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
      }
      this.notifyListeners();
    });
  }

  async loginAsOwner(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Profile will be handled by onAuthStateChanged
    return new Promise((resolve) => {
      const wait = setInterval(() => {
        if (this.currentUser) {
          clearInterval(wait);
          resolve(this.currentUser);
        }
      }, 100);
    });
  }

  async loginAsGuest(): Promise<UserProfile> {
    const userCredential = await signInAnonymously(auth);
    return new Promise((resolve) => {
      const wait = setInterval(() => {
        if (this.currentUser) {
          clearInterval(wait);
          resolve(this.currentUser);
        }
      }, 100);
    });
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isOwner(): boolean {
    return this.currentUser?.role === 'owner';
  }

  onAuthStateChanged(listener: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(listener);
    // Call immediately with current state
    listener(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  }
}

export const authService = new AuthService();
