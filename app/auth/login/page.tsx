"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      setError("Failed to login. Please check your credentials.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-2xl font-semibold text-[#333333] mb-6">Login</h1>

      {error && <p className="text-[#e74c3c] text-sm mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="email" className="block text-base font-semibold text-[#333333] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-base font-semibold text-[#333333] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-base text-[#333333]">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-[#3498db] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}