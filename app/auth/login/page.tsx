"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FaEnvelope, FaLock, FaSpinner, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to login. Please check your credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-tl from-white to-blue-50 relative overflow-hidden">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Login
      </h1>
      <p className="text-lg text-gray-600 mb-10 font-light text-center max-w-md">
        Welcome back to Masai School’s pair programming platform.
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-6 bg-red-50 px-4 py-2 rounded-full">{error}</p>
      )}

      <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-300"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-300"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>Login</span>
            </>
          )}
        </button>
      </form>

      {/* Signup Link */}
      <p className="mt-6 text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link href="/auth/signup" className="text-indigo-600 hover:underline font-medium">
          Sign up
        </Link>
      </p>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100 rounded-full opacity-20 filter blur-3xl animate-float animation-delay-2000"></div>
      </div>
    </main>
  );
}