"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function AdminPanel() {
  const { user, loading, userData } = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }

    if (!loading && user && userData?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, loading, userData, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users")
        const querySnapshot = await getDocs(usersRef)

        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUsers(usersList)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to load users. Please try again.")
      } finally {
        setLoadingUsers(false)
      }
    }

    if (user && userData?.role === "admin") {
      fetchUsers()
    }
  }, [user, userData])

  const handleUpdateSessionLimit = async (userId, newLimit) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        sessionLimit: Number.parseInt(newLimit),
      })

      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return { ...user, sessionLimit: Number.parseInt(newLimit) }
          }
          return user
        }),
      )

      setSuccess("Session limit updated successfully.")
    } catch (error) {
      console.error("Error updating session limit:", error)
      setError("Failed to update session limit. Please try again.")
    }
  }

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  if (userData.role !== "admin") {
    return <p className="text-[#333333] text-center mt-8">Only admins can access this page.</p>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">
      <h1 className="text-2xl font-bold text-[#333333] mb-6">Admin Panel</h1>

      {error && <p className="text-[#e74c3c] mb-4">{error}</p>}
      {success && <p className="text-[#2ecc71] mb-4">{success}</p>}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-4">Manage Users</h2>

        {loadingUsers ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <p className="text-[#333333]">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#f5f5f5]">
                  <th className="text-left p-3 text-[#333333]">Name</th>
                  <th className="text-left p-3 text-[#333333]">Email</th>
                  <th className="text-left p-3 text-[#333333]">Role</th>
                  <th className="text-left p-3 text-[#333333]">Course</th>
                  <th className="text-left p-3 text-[#333333]">Session Count</th>
                  <th className="text-left p-3 text-[#333333]">Session Limit</th>
                  <th className="text-left p-3 text-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#e0e0e0]">
                    <td className="p-3 text-[#333333]">{user.name}</td>
                    <td className="p-3 text-[#333333]">{user.email}</td>
                    <td className="p-3 text-[#333333]">{user.role}</td>
                    <td className="p-3 text-[#333333]">{user.course || "N/A"}</td>
                    <td className="p-3 text-[#333333]">{user.sessionCount || 0}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        defaultValue={user.sessionLimit || 5}
                        min={1}
                        max={20}
                        className="w-20 p-2 border border-[#e0e0e0] rounded-lg focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db] outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const input = document.querySelector(`tr[key="${user.id}"] input`)
                          handleUpdateSessionLimit(user.id, input?.textContent)
                        }}
                        className="bg-[#3498db] text-white px-4 py-2 rounded-lg hover:bg-[#2980b9] transition-colors"
                      >
                        Update Limit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

