"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, isFirebaseConfigured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, redirect to planner
  useEffect(() => {
    if (!loading && user) {
      router.replace("/planner");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // subscribeToAuthChanges will trigger and redirect to /planner
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      // Firebase error codes that are safe to surface
      if (msg.includes("popup-closed-by-user") || msg.includes("cancelled")) {
        setError("Sign-in was cancelled. Please try again.");
      } else if (msg.includes("popup-blocked")) {
        setError(
          "Your browser blocked the sign-in popup. Please allow popups for this site."
        );
      } else if (msg.includes("network-request-failed")) {
        setError("Network error. Please check your connection and retry.");
      } else {
        setError("Could not sign in with Google. Please try again.");
      }
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
      <div className="max-w-md w-full space-y-8 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg relative">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        {/* Logo & Headline */}
        <div className="text-center space-y-3">
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

        {/* Dev / Demo Note */}
        {!isFirebaseConfigured && (
          <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
              <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Instant Test Sign-In Enabled</span>
            </div>
            <p className="leading-relaxed">
              Firebase credentials not configured yet in <code className="text-[11px] bg-[var(--border)] px-1 py-0.5 rounded">.env.local</code>. Continuing will log you in as a test user instantly.
            </p>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="space-y-4 pt-2">
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] hover:border-[var(--primary)] text-[var(--text)] font-semibold text-sm transition-all shadow-xs active:scale-[0.99] group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)] shrink-0" />
            ) : (
              /* Google G SVG */
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{isSigningIn ? "Signing in…" : "Continue with Google"}</span>
          </button>

          {/* Promise Line */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] text-center">
            <Lock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>No password to remember • Instant sign-in for returning users</span>
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
