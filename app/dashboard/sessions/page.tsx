"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import SessionCard from "@/components/sessions/session-card"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function Sessions() {
  const { user, loading, userData } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user || !userData) return

      try {
        const sessionsRef = collection(db, "sessions")
        let q

        if (userData.role === "student") {
          q = query(sessionsRef, where("studentId", "==", user.uid))
        } else if (userData.role === "mentor") {
          q = query(sessionsRef, where("mentorId", "==", user.uid))
        } else {
          // Admin can see all sessions
          q = query(sessionsRef)
        }

        const querySnapshot = await getDocs(q)
        const sessionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setSessions(sessionsList)
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (user && userData) {
      fetchSessions()
    }
  }, [user, userData])

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  if (loadingSessions) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">My Sessions</h1>

      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} userRole={userData.role} />
          ))}
        </div>
      )}
    </div>
  )
}

