"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function MentorDashboard() {
  const { user, userData } = useAuth()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user) return

      try {
        const now = new Date().toISOString()
        const sessionsRef = collection(db, "sessions")
        const q = query(
          sessionsRef,
          where("mentorId", "==", user.uid),
          where("startTime", ">=", now),
          where("status", "==", "scheduled"),
          orderBy("startTime"),
          limit(3),
        )

        const querySnapshot = await getDocs(q)
        const sessionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUpcomingSessions(sessionsList)
      } catch (error) {
        console.error("Error fetching upcoming sessions:", error)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (user) {
      fetchUpcomingSessions()
    }
  }, [user])

  if (!userData) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#333333] mb-2">Welcome, {userData.name}!</h2>
        <p className="text-base text-[#333333]">Course: {userData.course}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {/* <h2 className="text-xl font-semibold text-[#333333] mb-2">Upcoming Sessions</h2> */}

          {/* {loadingSessions ? (
            <LoadingSpinner />
          ) : upcomingSessions.length === 0 ? (
            <p className="text-base text-[#333333]">No upcoming sessions.</p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const startTime = new Date(session.startTime)

                return (
                  <div 
                    key={session.id} 
                    className="p-4 bg-white border border-[#e0e0e0] rounded-lg shadow-sm"
                  >
                    <p className="text-base text-[#333333] mb-1">
                      Student: {session.studentName}
                    </p>
                    <p className="text-base text-[#333333] mb-1">
                      Date: {startTime.toLocaleDateString()}
                    </p>
                    <p className="text-base text-[#333333] mb-2">
                      Time: {startTime.toLocaleTimeString()}
                    </p>
                    <Link href={`/dashboard/sessions`}>
                      <button className="bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )} */}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#333333] mb-2">Quick Actions</h2>

          <div className="space-y-4">
            <Link href="/dashboard/availability">
              <button className="w-full bg-[#2ecc71] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#27ae60] transition-colors">
                Manage Availability
              </button>
            </Link>
            <hr />

            <Link href="/dashboard/sessions">
              <button className="w-full bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors">
                View All Sessions
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}