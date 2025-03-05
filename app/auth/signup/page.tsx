"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [course, setCourse] = useState("Coding")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate mentor and admin codes
    if (role === "mentor" && verificationCode !== "123") {
      setError("Invalid mentor verification code")
      setLoading(false)
      return
    }

    if (role === "admin" && verificationCode !== "admin") {
      setError("Invalid admin verification code")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const roles = [role]
      if (role === "mentor" || role === "admin") {
        roles.push("student") // Mentors and admins can also be students
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        roles,
        activeRole: role,
        course: role === "student" ? course : null,
        createdAt: new Date().toISOString(),
        sessionCount: 0,
      })

      if (role === "mentor") {
        await setDoc(doc(db, "mentors", user.uid), {
          name,
          email,
          course,
          availabilitySlots: [],
        })
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Failed to create account. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-2xl font-semibold text-[#333333] mb-6">Sign Up</h1>

      {error && <p className="text-[#e74c3c] text-sm mb-4">{error}</p>}

      <form onSubmit={handleSignup} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-base font-semibold text-[#333333] mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
          />
        </div>

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

        <div className="mb-4">
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

        <div className="mb-4">
          <label htmlFor="role" className="block text-base font-semibold text-[#333333] mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === "student" && (
          <div className="mb-4">
            <label htmlFor="course" className="block text-base font-semibold text-[#333333] mb-1">
              Course
            </label>
            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
            >
              <option value="Coding">Coding</option>
              <option value="DSA">DSA</option>
              <option value="Digital Marketing">Digital Marketing</option>
            </select>
          </div>
        )}

        {role === "mentor" && (
          <>
            <div className="mb-4">
              <label htmlFor="mentorCourse" className="block text-base font-semibold text-[#333333] mb-1">
                Course You Mentor
              </label>
              <select
                id="mentorCourse"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
              >
                <option value="Coding">Coding</option>
                <option value="DSA">DSA</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="verificationCode" className="block text-base font-semibold text-[#333333] mb-1">
                Mentor Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
              />
            </div>
          </>
        )}

        {role === "admin" && (
          <div className="mb-4">
            <label htmlFor="adminCode" className="block text-base font-semibold text-[#333333] mb-1">
              Admin Verification Code
            </label>
            <input
              id="adminCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="w-full border border-[#e0e0e0] rounded-lg px-2 py-1 text-base text-[#333333] focus:outline-none focus:border-[#3498db] focus:border-2"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-base text-[#333333]">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#3498db] hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

