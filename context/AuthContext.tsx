"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  switchRole: async (role) => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserData({
              ...data,
              roles: data.roles || [data.role], // Ensure roles is an array
              activeRole: data.activeRole || data.role, // Set active role
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const switchRole = async (role) => {
    if (user && userData.roles.includes(role)) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          activeRole: role,
        })
        setUserData({ ...userData, activeRole: role })
        // Optionally, redirect to the appropriate dashboard
        router.push("/dashboard")
      } catch (error) {
        console.error("Error switching role:", error)
      }
    }
  }

  return <AuthContext.Provider value={{ user, userData, loading, logout, switchRole }}>{children}</AuthContext.Provider>
}

