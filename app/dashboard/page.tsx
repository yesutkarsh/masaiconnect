"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import StudentDashboard from "@/components/dashboard/student-dashboard"
import MentorDashboard from "@/components/dashboard/mentor-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function Dashboard() {
  const { user, loading, userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {userData.role === "student" && <StudentDashboard />}
      {userData.role === "mentor" && <MentorDashboard />}
      {userData.role === "admin" && <AdminDashboard />}
    </div>
  )
}

