"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmailProfile,
  googleClientId,
  isGoogleConfigured,
  saveGoogleCredentialUser,
  saveGoogleProfileUser,
} from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, isFirebaseConfigured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Form state for instant profile login
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // If already signed in, redirect to planner
  useEffect(() => {
    if (!loading && user) {
      router.replace("/planner");
    }
  }, [user, loading, router]);

  // Initialize Google Identity Services (GSI) when script is ready
  useEffect(() => {
    if (!gsiLoaded || !isGoogleConfigured || typeof window === "undefined" || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          try {
            setIsSigningIn(true);
            saveGoogleCredentialUser(response.credential);
            router.replace("/planner");
          } catch {
            setError("Could not process Google sign-in response.");
            setIsSigningIn(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 340,
        });
      }
    } catch (err) {
      console.warn("GSI initialization error:", err);
    }
  }, [gsiLoaded, router]);

  const handleProfileSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to personalize your wellness plan.");
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithEmailProfile({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);

    try {
      // 1. If Firebase is fully configured, use Firebase auth popup
      if (isFirebaseConfigured) {
        await signInWithGoogle();
        return;
      }

      // 2. If Google Client ID is configured and Google SDK is loaded in browser
      if (isGoogleConfigured && typeof window !== "undefined" && window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResp) => {
            if (tokenResp.error) {
              if (tokenResp.error === "popup_closed_by_user" || tokenResp.error === "access_denied") {
                setError("Google sign-in was cancelled.");
              } else {
                setError(
                  `Google error (${tokenResp.error}). Ensure http://localhost:3000 is added to Authorized JavaScript Origins in your Google Cloud Console.`
                );
              }
              setIsSigningIn(false);
              return;
            }

            if (tokenResp.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResp.access_token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch user profile from Google");
                const profile = await res.json();
                saveGoogleProfileUser({
                  sub: profile.sub,
                  name: profile.name,
                  email: profile.email,
                  picture: profile.picture,
                });
                router.replace("/planner");
              } catch {
                setError("Failed to retrieve Google profile. Please try instant profile sign-in.");
              } finally {
                setIsSigningIn(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken();
        return;
      }

      // 3. Fallback demo user
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(msg);
      setIsSigningIn(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show a soft loading shimmer while the auth state is resolving on first load
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg relative">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="graceAI"
            className="w-14 h-14 rounded-2xl object-cover mx-auto shadow-sm"
          />
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text)]">
              Welcome to grace<span className="text-[var(--primary)] italic font-normal">ai</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Eat well. Live gracefully.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/25 text-sm text-[var(--danger)]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Instant Profile Sign-In Form */}
        <form onSubmit={handleProfileSignIn} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-name-input"
                type="text"
                placeholder="e.g. Sudhanshu or Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Optional</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          <button
            id="instant-signin-btn"
            type="submit"
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSigningIn ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Sign In Instantly</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--border)] w-full" />
          <span className="bg-[var(--surface)] px-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
            or continue with
          </span>
          <div className="border-t border-[var(--border)] w-full" />
        </div>

        {/* Load Google Identity Services */}
        {isGoogleConfigured && (
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setGsiLoaded(true)}
          />
        )}

        {/* Social / Alternative Buttons */}
        <div className="space-y-2.5">
          {/* Official Google GSI Rendered Button Container (renders when origin is authorized) */}
          <div ref={googleBtnRef} className="flex justify-center empty:hidden min-h-[44px]" />

          {/* Google Sign-In Button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] hover:border-[var(--primary)] text-[var(--text)] font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {/* Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>
              {isGoogleConfigured || isFirebaseConfigured
                ? "Continue with Google"
                : "Google Sign-In (Demo Access)"}
            </span>
          </button>

          {/* Quick Demo Guest Button */}
          <button
            id="guest-demo-btn"
            type="button"
            onClick={handleQuickDemo}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] text-xs font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Use Pre-filled Demo Account (Sarah Jenkins)</span>
          </button>

          {/* Promise Line */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] text-center pt-1">
            <Lock className="w-3 h-3 text-[var(--primary)] shrink-0" />
            <span>Zero passwords needed • Automatic sync across devices</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-[var(--border)] space-y-2.5 text-xs text-[var(--text-muted)]">
          {[
            "Personalised weekly meal plans & grouped grocery list",
            "Honest daily meal tracker with flexible logging",
            "Health Care guide for fever, allergies & skin conditions",
            "Chef Grace AI — recipes from whatever is in your fridge",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="pt-4 border-t border-[var(--border)] text-center space-y-2">
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-[var(--text)] underline hover:text-[var(--primary)]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[var(--text)] underline hover:text-[var(--primary)]">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            <Shield className="w-3 h-3 text-[var(--primary)]" />
            <span>DPDP Act 2023 Compliant • Medical Disclaimer Applies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
