"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type UserRole = {
  role: string;
};
export default function WorkerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   setIsLoading(true);

  //   try {
  //     // Step 1: Sign in with Supabase
  //     const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (authError) {
  //       throw new Error(authError.message);
  //     }

  //     if (!authData.user) {
  //       throw new Error('Login failed. Please try again.');
  //     }

  //     // Step 2: Fetch user role from user_roles table
  //     const { data: roleData, error: roleError } = await supabase
  //       .from('user_roles')
  //       .select('role')
  //       .eq('user_id', authData.user.id)
  //       .single();

  //     if (roleError) {
  //       await supabase.auth.signOut();
  //       throw new Error('Unable to verify user role. Please contact support.');
  //     }

  //     // Step 3: Verify role is worker
  //     if (roleData.role !== 'worker') {
  //       await supabase.auth.signOut();
  //       throw new Error('Access denied. This account is not authorized as a worker.');
  //     }

  //     // Step 4: Redirect to worker home
  //     router.push('/worker/home');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An error occurred during login');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Step 1: Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Login failed. Please try again.");
      }


      // Step 2: Fetch role from user_roles (IMPORTANT FIX 🔥)
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", authData.user.id) // ✅ CORRECT COLUMN (FK → auth.users.id)
        .single<UserRole>();

      if (roleError || !roleData) {
        // If role not found → logout for safety
        await supabase.auth.signOut();
        throw new Error("Unable to verify user role. Please contact support.");
      }

      // Step 3: Check if user is a worker
      if (roleData?.role !== "worker") {
        await supabase.auth.signOut();
        throw new Error(
          "Access denied. This account is not authorized as a worker.",
        );
      }
      // Step 4: Redirect to worker dashboard
      router.push("/construction-worker");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Navigation */}
      <nav className="border-b border-stone-200 bg-white">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-stone-900">
              BuildTrack
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            Back
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              Worker Login
            </h1>
            <p className="text-stone-600 text-sm">
              Sign in to access your work logs
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="worker@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-2">Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Alternative Login */}
          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-600">
              Are you a manager?{" "}
              <Link
                href="/auth/loginAdmin"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
