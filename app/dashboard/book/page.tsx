"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"

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

  const [selectedCourse, setSelectedCourse] = useState("Coding")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState([])

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
        const q = query(mentorsRef, where("course", "==", selectedCourse))
        const querySnapshot = await getDocs(q)

        const mentorsList = []
        const dates = new Set()
        for (const docSnapshot of querySnapshot.docs) {
          const mentorData = docSnapshot.data()
          const userDoc = await getDoc(doc(db, "users", docSnapshot.id))

          mentorData.availabilitySlots.forEach((slot) => {
            if (!slot.booked) {
              dates.add(format(new Date(slot.startTime), "yyyy-MM-dd"))
            }
          })

          mentorsList.push({
            id: docSnapshot.id,
            ...mentorData,
            userData: userDoc.data(),
          })
        }

        setMentors(mentorsList)
        setAvailableDates(Array.from(dates).map((date) => new Date(date)))
      } catch (error) {
        console.error("Error fetching mentors:", error)
        setError("Failed to load mentors. Please try again.")
      } finally {
        setLoadingMentors(false)
      }
    }

    fetchMentors()
  }, [userData, selectedCourse])

  useEffect(() => {
    if (selectedMentor) {
      const slotsForSelectedDate = selectedMentor.availabilitySlots.filter((slot) => {
        const slotDate = new Date(slot.startTime)
        return isSameDay(slotDate, selectedDate) && !slot.booked
      })

      setAvailableSlots(slotsForSelectedDate)
    } else {
      setAvailableSlots([])
    }
  }, [selectedMentor, selectedDate])

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
        course: selectedCourse,
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

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {dateRange.map((date, idx) => {
          const isAvailable = availableDates.some((availableDate) => isSameDay(availableDate, date))
          return (
            <button
              key={idx}
              onClick={() => isAvailable && setSelectedDate(date)}
              className={`p-2 text-center ${
                isSameDay(date, selectedDate)
                  ? "bg-[#3498db] text-white"
                  : isAvailable
                    ? "bg-[#2ecc71] text-white hover:bg-[#27ae60]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!isAvailable}
            >
              {format(date, "d")}
            </button>
          )
        })}
      </div>
    )
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

      {/* Course Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Select a Course</h2>
        <div className="flex space-x-4">
          {["Coding", "DSA", "Digital Marketing"].map((course) => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-4 py-2 rounded-lg ${
                selectedCourse === course ? "bg-[#3498db] text-white" : "bg-gray-200 text-[#333333] hover:bg-gray-300"
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* Month and Date Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Select a Date</h2>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="bg-[#3498db] text-white px-4 py-2 rounded-lg"
          >
            Previous Month
          </button>
          <span className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="bg-[#3498db] text-white px-4 py-2 rounded-lg"
          >
            Next Month
          </button>
        </div>
        {renderCalendar()}
      </div>

      {/* Mentor Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Available Mentors</h2>

        {loadingMentors ? (
          <LoadingSpinner />
        ) : mentors.length === 0 ? (
          <p className="text-base text-[#333333]">No mentors available for the selected course and date.</p>
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
                  Available Slots:{" "}
                  {
                    mentor.availabilitySlots.filter(
                      (slot) => !slot.booked && isSameDay(new Date(slot.startTime), selectedDate),
                    ).length
                  }
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
            <p className="text-base text-[#333333]">No available slots for this mentor on the selected date.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableSlots.map((slot) => {
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
                      Time: {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
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

