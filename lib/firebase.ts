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

export const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const isGoogleConfigured = Boolean(googleClientId);

const LOCAL_USER_KEY = "graceai_active_user";
const LEGACY_DEMO_KEY = "graceai_demo_user";

export function saveLocalUser(user: AppUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LEGACY_DEMO_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("graceai_auth_change"));
  }
}

export function clearLocalUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LEGACY_DEMO_KEY);
    window.dispatchEvent(new Event("graceai_auth_change"));
  }
}

export function getStoredLocalUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY) || localStorage.getItem(LEGACY_DEMO_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function parseGoogleJwt(token: string): {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
} {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export function saveGoogleCredentialUser(credential: string): AppUser {
  const payload = parseGoogleJwt(credential);
  const user: AppUser = {
    uid: payload.sub,
    displayName: payload.name || "Google User",
    email: payload.email || null,
    photoURL: payload.picture || null,
  };
  saveLocalUser(user);
  return user;
}

export function saveGoogleProfileUser(profile: {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}): AppUser {
  const user: AppUser = {
    uid: profile.sub,
    displayName: profile.name || "Google User",
    email: profile.email || null,
    photoURL: profile.picture || null,
  };
  saveLocalUser(user);
  return user;
}

/**
 * Sign in directly with a custom Name and Email without requiring Firebase keys.
 */
export async function signInWithEmailProfile(params: {
  name: string;
  email: string;
}): Promise<AppUser> {
  const trimmedName = params.name.trim();
  const trimmedEmail = params.email.trim().toLowerCase();

  const initials = encodeURIComponent(trimmedName || "User");
  const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=0D9488&color=ffffff&bold=true&rounded=true`;

  const user: AppUser = {
    uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayName: trimmedName || "Culinary Explorer",
    email: trimmedEmail || null,
    photoURL: avatarUrl,
  };

  saveLocalUser(user);
  return user;
}

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
  saveLocalUser(mockUser);
  return mockUser;
}

export async function signOut(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  clearLocalUser();
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
        const local = getStoredLocalUser();
        callback(local);
      }
    });
    return unsub;
  }

  // Listen for local auth changes
  const checkLocal = () => {
    callback(getStoredLocalUser());
  };

  checkLocal();
  window.addEventListener("graceai_auth_change", checkLocal);
  window.addEventListener("storage", checkLocal);

  return () => {
    window.removeEventListener("graceai_auth_change", checkLocal);
    window.removeEventListener("storage", checkLocal);
  };
}
