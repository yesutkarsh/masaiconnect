"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function BookSession() {
const { user, loading, userData } = useAuth()
const [mentors, setMentors] = useState([])
const [selectedMentor, setSelectedMentor] = useState(null)
const [availableSlots, setAvailableSlots] = useState([])
const [selectedSlot, setSelectedSlot] = useState(null)
const [loadingMentors, setLoadingMentors] = useState(true)
const [error, setError] = useState("")
const [bookingInProgress, setBookingInProgress] = useState(false)
const [currentTab, setCurrentTab] = useState("mentor")
const [selectedDate, setSelectedDate] = useState(new Date())
const [dateHasSlots, setDateHasSlots] = useState({})
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
    return slotDate > now && !slot.booked
    })

    setAvailableSlots(futureSlots)
    
    // Create a map of dates with available slots
    const datesWithSlots = {}
    futureSlots.forEach((slot) => {
    const slotDate = new Date(slot.startTime)
    const dateStr = slotDate.toDateString()
    if (!datesWithSlots[dateStr]) {
        datesWithSlots[dateStr] = []
    }
    datesWithSlots[dateStr].push(slot)
    })
    setDateHasSlots(datesWithSlots)
} else {
    setAvailableSlots([])
    setDateHasSlots({})
}
}, [selectedMentor])

const handleMentorSelect = (mentor) => {
setSelectedMentor(mentor)
setSelectedSlot(null)
setCurrentTab("date")
}

const handleSlotSelect = (slot) => {
setSelectedSlot(slot)
setCurrentTab("confirm")
}

const handleDateSelect = (date) => {
setSelectedDate(date)
}

const getSlotsForSelectedDate = () => {
if (!selectedDate || !dateHasSlots) return []

return availableSlots.filter(slot => {
    const slotDate = new Date(slot.startTime)
    return slotDate.toDateString() === selectedDate.toDateString() && !slot.booked
})
}

const getAvailableDates = () => {
return Object.keys(dateHasSlots).map(dateStr => new Date(dateStr))
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

    {error && <div className="p-3 mb-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
    <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="mentor" disabled={loadingMentors}>1. Select Mentor</TabsTrigger>
        <TabsTrigger value="date" disabled={!selectedMentor}>2. Choose Date & Time</TabsTrigger>
        <TabsTrigger value="confirm" disabled={!selectedSlot}>3. Confirm Booking</TabsTrigger>
    </TabsList>

    {/* Step 1: Mentor Selection */}
    <TabsContent value="mentor" className="space-y-4">
        <div className="pb-4">
        <h2 className="text-xl font-semibold text-[#333333] mb-4">Select a Mentor</h2>
        
        {loadingMentors ? (
            <div className="flex justify-center p-8">
            <LoadingSpinner />
            </div>
        ) : mentors.length === 0 ? (
            <Card>
            <CardContent className="pt-6">
                <p className="text-base text-center text-[#666666]">No mentors available for your course.</p>
            </CardContent>
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
                <Card 
                key={mentor.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedMentor?.id === mentor.id ? "ring-2 ring-[#3498db]" : ""
                }`}
                onClick={() => handleMentorSelect(mentor)}
                >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.userData?.profilePicture || ""} alt={mentor.name} />
                    <AvatarFallback>{mentor.name?.charAt(0) || "M"}</AvatarFallback>
                    </Avatar>
                    <div>
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <CardDescription>Course: {mentor.course}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Expertise:</span>
                    <span>{mentor.expertiseAreas?.join(", ") || "General"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                    <span className="text-[#666666]">Available Slots:</span>
                    <Badge variant="secondary">{mentor.availabilitySlots.filter((slot) => !slot.booked).length}</Badge>
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full" onClick={() => handleMentorSelect(mentor)}>
                    Select Mentor
                    </Button>
                </CardFooter>
                </Card>
}