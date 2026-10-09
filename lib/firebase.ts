import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn("Failed to initialize Firebase app:", err);
  }
}

const DEMO_USER_KEY = "graceai_demo_user";

export async function signInWithGoogle(): Promise<AppUser> {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
    };
  }

  // Fallback demo user when Firebase credentials are not yet added to .env.local
  const mockUser: AppUser = {
    uid: "demo-user-123",
    email: "sarah.nourish@graceai.demo",
    displayName: "Sarah Jenkins",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    window.dispatchEvent(new Event("graceai_auth_change"));
  }
  return mockUser;
}

export async function signOut(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_USER_KEY);
    window.dispatchEvent(new Event("graceai_auth_change"));
  }
}

export function subscribeToAuthChanges(callback: (user: AppUser | null) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (isFirebaseConfigured && auth) {
    const unsub = firebaseOnAuthStateChanged(auth, (u) => {
      if (u) {
        callback({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
        });
      } else {
        callback(null);
      }
    });
    return unsub;
  }

  // Listen for local demo auth changes
  const checkLocal = () => {
    try {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        callback(JSON.parse(stored) as AppUser);
      } else {
        callback(null);
      }
    } catch {
      callback(null);
    }
  };

  checkLocal();
  window.addEventListener("graceai_auth_change", checkLocal);
  window.addEventListener("storage", checkLocal);

  return () => {
    window.removeEventListener("graceai_auth_change", checkLocal);
    window.removeEventListener("storage", checkLocal);
  };
}
