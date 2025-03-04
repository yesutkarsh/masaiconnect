"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SessionCard({ session, userRole }) {
  const [status, setStatus] = useState(session.status)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [meetingLink, setMeetingLink] = useState("")

  const startTime = new Date(session.startTime)
  const endTime = new Date(session.endTime)
  const now = new Date()

  const isPast = endTime < now

  useEffect(() => {
    // Generate a unique room name based on the session ID
    const roomName = `masai-session-${session.id}`

    // Create Jitsi meeting link
    const jitsiLink = `https://meet.jit.si/${roomName}`
    setMeetingLink(jitsiLink)

    // For future Google Meet API integration:
    // TODO: Replace the above code with Google Meet API call
    // const meetLink = await createGoogleMeetLink(session);
    // setMeetingLink(meetLink);
  }, [session.id])

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true)
    setError("")

    try {
      await updateDoc(doc(db, "sessions", session.id), {
        status: newStatus,
      })

      setStatus(newStatus)
    } catch (error) {
      console.error("Error updating session status:", error)
      setError("Failed to update session status.")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    const fiveHoursBeforeStart = new Date(startTime.getTime() - 5 * 60 * 60 * 1000)

    if (now > fiveHoursBeforeStart) {
      setError("Sessions can only be cancelled at least 5 hours before the start time.")
      return
    }

    setUpdating(true)
    setError("")

    try {
      await updateDoc(doc(db, "sessions", session.id), {
        status: "cancelled",
      })

      setStatus("cancelled")
    } catch (error) {
      console.error("Error cancelling session:", error)
      setError("Failed to cancel session.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="p-4 bg-white border border-[#e0e0e0] rounded-lg shadow-sm">
      {error && <p className="text-[#e74c3c] text-sm mb-2">{error}</p>}

      {/* Session Details */}
      <div className="mb-4">
        <p className="text-base font-semibold text-[#333333]">
          Status: <span className="font-normal">{status}</span>
        </p>
        <p className="text-base font-semibold text-[#333333]">
          {userRole === "student" ? "Mentor" : "Student"}:{" "}
          <span className="font-normal">
            {userRole === "student" ? session.mentorName : session.studentName}
          </span>
        </p>
        <p className="text-base font-semibold text-[#333333]">
          Course: <span className="font-normal">{session.course}</span>
        </p>
        <p className="text-base font-semibold text-[#333333]">
          Date: <span className="font-normal">{startTime.toLocaleDateString()}</span>
        </p>
        <p className="text-base font-semibold text-[#333333]">
          Time:{" "}
          <span className="font-normal">
            {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
          </span>
        </p>
      </div>

      {/* Meeting Link */}
      {meetingLink && (
        <div className="mb-4">
          <p className="text-base font-semibold text-[#333333] mb-1">Meeting Link:</p>
          <div className="flex items-center">
            <input
              type="text"
              value={meetingLink}
              readOnly
              className="flex-grow border border-[#e0e0e0] rounded-l-lg px-2 py-1 text-sm text-[#333333] bg-[#f5f5f5] focus:outline-none focus:border-[#3498db] focus:border-2"
            />
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3498db] text-white font-bold px-4 py-1 rounded-r-lg text-sm hover:bg-[#2980b9] transition-colors"
            >
              Join
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {status === "scheduled" && (
        <div className="space-y-2">
          {!isPast && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="w-full bg-[#e74c3c] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#c0392b] transition-colors disabled:opacity-50"
            >
              {updating ? "Cancelling..." : "Cancel Session"}
            </button>
          )}

          {userRole === "mentor" && isPast && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus("completed")}
                disabled={updating}
                className="flex-1 bg-[#2ecc71] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#27ae60] transition-colors disabled:opacity-50"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleUpdateStatus("no-show")}
                disabled={updating}
                className="flex-1 bg-[#f1c40f] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#d4ac0d] transition-colors disabled:opacity-50"
              >
                Mark as No-Show
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}