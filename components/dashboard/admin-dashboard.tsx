"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function AdminDashboard() {
  const { userData } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalSessions: 0,
    upcomingSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))
        const studentsSnapshot = await getDocs(studentsQuery)

        const mentorsQuery = query(collection(db, "users"), where("role", "==", "mentor"))
        const mentorsSnapshot = await getDocs(mentorsQuery)

        const sessionsSnapshot = await getDocs(collection(db, "sessions"))

        const now = new Date().toISOString()
        const upcomingSessionsQuery = query(
          collection(db, "sessions"),
          where("startTime", ">=", now),
          where("status", "==", "scheduled"),
        )
        const upcomingSessionsSnapshot = await getDocs(upcomingSessionsQuery)

        setStats({
          totalStudents: studentsSnapshot.size,
          totalMentors: mentorsSnapshot.size,
          totalSessions: sessionsSnapshot.size,
          upcomingSessions: upcomingSessionsSnapshot.size,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (!userData) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f5]">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#333333] mb-2">Welcome, {userData.name}!</h2>
        <p className="text-base text-[#333333]">Admin Dashboard</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Stat Cards */}
          {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-semibold text-[#333333] mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-[#3498db]">{stats.totalStudents}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-semibold text-[#333333] mb-1">Total Mentors</h3>
            <p className="text-3xl font-bold text-[#2ecc71]">{stats.totalMentors}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-semibold text-[#333333] mb-1">Total Sessions</h3>
            <p className="text-3xl font-bold text-[#f1c40f]">{stats.totalSessions}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e0e0e0]">
            <h3 className="text-base font-semibold text-[#333333] mb-1">Upcoming Sessions</h3>
            <p className="text-3xl font-bold text-[#e74c3c]">{stats.upcomingSessions}</p>
          </div> */}
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e0e0e0]">
        <h2 className="text-xl font-semibold text-[#333333] mb-4">Quick Actions</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/dashboard/admin">
            <button className="w-full bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors">
              Manage Users
            </button>
          </Link>

          <Link href="/dashboard/sessions">
            <button className="w-full bg-[#2ecc71] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#27ae60] transition-colors">
              View All Sessions
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}