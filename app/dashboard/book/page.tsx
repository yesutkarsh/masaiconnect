"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function BookSession() {
  const { user, loading, userData } = useAuth()
  const [mentors, setMentors] = useState([])
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loadingMentors, setLoadingMentors] = useState(true)
  const [error, setError] = useState("")
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }

    if (!loading && user && userData?.role !== "student") {
      router.push("/dashboard")
    }
  }, [user, loading, userData, router])

  useEffect(() => {
    const fetchMentors = async () => {
      if (!userData) return

      try {
        const mentorsRef = collection(db, "mentors")
        const q = query(mentorsRef, where("course", "==", userData.course))
        const querySnapshot = await getDocs(q)

        const mentorsList = []
        for (const docSnapshot of querySnapshot.docs) {
          const mentorData = docSnapshot.data()
          const userDoc = await getDoc(doc(db, "users", docSnapshot.id))

          mentorsList.push({
            id: docSnapshot.id,
            ...mentorData,
            userData: userDoc.data(),
          })
        }

        setMentors(mentorsList)
      } catch (error) {
        console.error("Error fetching mentors:", error)
        setError("Failed to load mentors. Please try again.")
      } finally {
        setLoadingMentors(false)
      }
    }

    if (userData) {
      fetchMentors()
    }
  }, [userData])

  useEffect(() => {
    if (selectedMentor) {
      const now = new Date()
      const futureSlots = selectedMentor.availabilitySlots.filter((slot) => {
        const slotDate = new Date(slot.startTime)
        return slotDate > now
      })

      setAvailableSlots(futureSlots)
    } else {
      setAvailableSlots([])
    }
  }, [selectedMentor])

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
  }

  const handleBookSession = async () => {
    if (!selectedMentor || !selectedSlot) {
      setError("Please select a mentor and a time slot.")
      return
    }

    if (userData.sessionCount >= 5) {
      setError("You have reached your monthly session limit (5 sessions).")
      return
    }

    setBookingInProgress(true)
    setError("")

    try {
      const mentorDoc = await getDoc(doc(db, "mentors", selectedMentor.id))
      const mentorData = mentorDoc.data()

      const slotStillAvailable = mentorData.availabilitySlots.some(
        (slot) => slot.id === selectedSlot.id && !slot.booked,
      )

      if (!slotStillAvailable) {
        setError("This slot is no longer available. Please select another slot.")
        setBookingInProgress(false)
        return
      }

      const sessionData = {
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        studentId: user.uid,
        studentName: userData.name,
        course: userData.course,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        googleMeetLink: "http:link",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "sessions"), sessionData)

      const updatedSlots = mentorData.availabilitySlots.map((slot) => {
        if (slot.id === selectedSlot.id) {
          return { ...slot, booked: true }
        }
        return slot
      })

      await updateDoc(doc(db, "mentors", selectedMentor.id), {
        availabilitySlots: updatedSlots,
      })

      await updateDoc(doc(db, "users", user.uid), {
        sessionCount: increment(1),
      })

      router.push("/dashboard/sessions")
    } catch (error) {
      console.error("Error booking session:", error)
      setError("Failed to book session. Please try again.")
    } finally {
      setBookingInProgress(false)
    }
  }

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  if (userData.role !== "student") {
    return <p className="text-[#333333] text-base">Only students can book sessions.</p>
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-semibold text-[#333333] mb-6">Book a Session</h1>

      {error && <p className="text-[#e74c3c] text-sm mb-4">{error}</p>}

      {/* Mentor Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Select a Mentor</h2>

        {loadingMentors ? (
          <LoadingSpinner />
        ) : mentors.length === 0 ? (
          <p className="text-base text-[#333333]">No mentors available for your course.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className={`p-4 bg-white border border-[#e0e0e0] rounded-lg shadow-sm cursor-pointer hover:border-[#3498db] transition-colors ${
                  selectedMentor?.id === mentor.id ? "border-[#3498db]" : ""
                }`}
                onClick={() => handleMentorSelect(mentor)}
              >
                <h3 className="text-base font-semibold text-[#333333]">{mentor.name}</h3>
                <p className="text-base text-[#333333]">Course: {mentor.course}</p>
                <p className="text-base text-[#333333]">
                  Available Slots: {mentor.availabilitySlots.filter((slot) => !slot.booked).length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slot Selection */}
      {selectedMentor && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-2">Select a Time Slot</h2>

          {availableSlots.length === 0 ? (
            <p className="text-base text-[#333333]">No available slots for this mentor.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableSlots
                .filter((slot) => !slot.booked)
                .map((slot) => {
                  const startTime = new Date(slot.startTime)
                  const endTime = new Date(slot.endTime)

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 bg-white border border-[#e0e0e0] rounded-lg shadow-sm cursor-pointer hover:border-[#3498db] transition-colors ${
                        selectedSlot?.id === slot.id ? "border-[#3498db]" : ""
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <p className="text-base text-[#333333]">
                        Date: {startTime.toLocaleDateString()}
                      </p>
                      <p className="text-base text-[#333333]">
                        Time: {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
                      </p>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* Book Session Button */}
      {selectedMentor && selectedSlot && (
        <button
          onClick={handleBookSession}
          disabled={bookingInProgress}
          className="w-full bg-[#3498db] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2980b9] transition-colors disabled:opacity-50"
        >
          {bookingInProgress ? "Booking..." : "Book Session"}
        </button>
      )}
    </div>
  )
}