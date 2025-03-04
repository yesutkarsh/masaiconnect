"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { v4 as uuidv4 } from "uuid"

export default function ManageAvailability() {
  const { user, loading, userData } = useAuth()
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }

    if (!loading && user && userData?.role !== "mentor") {
      router.push("/dashboard")
    }
  }, [user, loading, userData, router])

  useEffect(() => {
    const fetchAvailabilitySlots = async () => {
      if (!user) return

      try {
        const mentorDoc = await getDoc(doc(db, "mentors", user.uid))
        if (mentorDoc.exists()) {
          const mentorData = mentorDoc.data()
          setAvailabilitySlots(mentorData.availabilitySlots || [])
        }
      } catch (error) {
        console.error("Error fetching availability slots:", error)
        setError("Failed to load availability slots. Please try again.")
      } finally {
        setLoadingSlots(false)
      }
    }

    if (user) {
      fetchAvailabilitySlots()
    }
  }, [user])

  const handleAddSlot = async () => {
    if (!date || !startTime || !endTime) {
      setError("Please fill in all fields.")
      return
    }

    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    if (startDateTime >= endDateTime) {
      setError("End time must be after start time.")
      return
    }

    if (startDateTime < new Date()) {
      setError("Cannot add slots in the past.")
      return
    }

    setError("")
    setSuccess("")

    try {
      const newSlot = {
        id: uuidv4(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        booked: false,
      }

      const updatedSlots = [...availabilitySlots, newSlot]

      await updateDoc(doc(db, "mentors", user.uid), {
        availabilitySlots: updatedSlots,
      })

      setAvailabilitySlots(updatedSlots)
      setDate("")
      setStartTime("")
      setEndTime("")
      setSuccess("Availability slot added successfully.")
    } catch (error) {
      console.error("Error adding availability slot:", error)
      setError("Failed to add availability slot. Please try again.")
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      const slot = availabilitySlots.find((s) => s.id === slotId)

      if (slot.booked) {
        setError("Cannot delete a booked slot.")
        return
      }

      const updatedSlots = availabilitySlots.filter((slot) => slot.id !== slotId)

      await updateDoc(doc(db, "mentors", user.uid), {
        availabilitySlots: updatedSlots,
      })

      setAvailabilitySlots(updatedSlots)
      setSuccess("Availability slot deleted successfully.")
    } catch (error) {
      console.error("Error deleting availability slot:", error)
      setError("Failed to delete availability slot. Please try again.")
    }
  }

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  if (userData.role !== "mentor") {
    return <p>Only mentors can manage availability.</p>
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Availability</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Availability Slot</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label htmlFor="startTime">Start Time</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        <button onClick={handleAddSlot} className="mt-4">
          Add Slot
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Availability Slots</h2>

        {loadingSlots ? (
          <LoadingSpinner />
        ) : availabilitySlots.length === 0 ? (
          <p>No availability slots added yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availabilitySlots.map((slot) => {
              const startTime = new Date(slot.startTime)
              const endTime = new Date(slot.endTime)

              return (
                <div key={slot.id} className={`p-4 border rounded-lg ${slot.booked ? "bg-gray-100" : ""}`}>
                  <p>Date: {startTime.toLocaleDateString()}</p>
                  <p>
                    Time: {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
                  </p>
                  <p>Status: {slot.booked ? "Booked" : "Available"}</p>

                  {!slot.booked && (
                    <button onClick={() => handleDeleteSlot(slot.id)} className="mt-2">
                      Delete
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

