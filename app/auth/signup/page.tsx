"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { FaUser, FaEnvelope, FaLock, FaChalkboardTeacher, FaCode, FaSpinner, FaSignInAlt } from "react-icons/fa";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [course, setCourse] = useState("Coding");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "mentor" && verificationCode !== "123") {
      setError("Invalid mentor verification code");
      setLoading(false);
      return;
    }

    if (role === "admin" && verificationCode !== "admin") {
      setError("Invalid admin verification code");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const roles = [role];
      if (role === "mentor" || role === "admin") {
        roles.push("student");
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        roles,
        activeRole: role,
        course: role === "student" ? course : null,
        createdAt: new Date().toISOString(),
        sessionCount: 0,
      });

      if (role === "mentor") {
        await setDoc(doc(db, "mentors", user.uid), {
          name,
          email,
          course,
          availabilitySlots: [],
        });
      }

      router.push("/dashboard");
    } catch (error) {
      setError("Failed to create account. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-tl from-white to-blue-50 relative overflow-hidden">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Sign Up
      </h1>
      <p className="text-lg text-gray-600 mb-10 font-light text-center max-w-md">
        Join Masai School’s pair programming platform today.
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-6 bg-red-50 px-4 py-2 rounded-full">{error}</p>
      )}

      <form onSubmit={handleSignup} className="w-full max-w-md space-y-6">
        {/* Full Name */}
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-300"
              placeholder="Enter your name"
            />
          </div>
        </div>

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
              placeholder="Create a password"
            />
          </div>
        </div>

        {/* Role */}
        <div className="relative">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="relative">
            <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 appearance-none transition-all duration-300"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Course (Student) */}
        {role === "student" && (
          <div className="relative">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <div className="relative">
              <FaCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 appearance-none transition-all duration-300"
              >
                <option value="Coding">Coding</option>
                <option value="DSA">DSA</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
          </div>
        )}

        {/* Mentor Course & Verification */}
        {role === "mentor" && (
          <>
            <div className="relative">
              <label htmlFor="mentorCourse" className="block text-sm font-medium text-gray-700 mb-1">
                Course You Mentor
              </label>
              <div className="relative">
                <FaCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                <select
                  id="mentorCourse"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 appearance-none transition-all duration-300"
                >
                  <option value="Coding">Coding</option>
                  <option value="DSA">DSA</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mentor Verification Code
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-300"
                  placeholder="Enter code"
                />
              </div>
            </div>
          </>
        )}

        {/* Admin Verification */}
        {role === "admin" && (
          <div className="relative">
            <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Verification Code
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <input
                id="adminCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-300"
                placeholder="Enter code"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>Sign Up</span>
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-indigo-600 hover:underline font-medium">
          Login
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