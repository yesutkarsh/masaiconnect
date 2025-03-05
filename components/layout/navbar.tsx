"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { FaUser, FaBook, FaCalendar, FaCog } from "react-icons/fa"
import { Menu } from "../ui/Menu"
import { MenuButton, MenuItem, MenuItems } from "../ui/Menu"
export default function Navbar() {
  const { user, logout, userData } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSwitchAccount = async (role) => {
    // Here you would implement the logic to switch the user's active role
    // This might involve updating the user's data in Firestore
    console.log(`Switching to ${role} account`)
    // After switching, you might want to refresh the user data
    // For now, we'll just close the menu
    setIsOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white border-b border-black/10 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">Masai Connect</Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Menu>
                    <MenuButton className="flex items-center space-x-2">
                      <FaUser />
                      <span>{userData?.name}</span>
                    </MenuButton>
                    <MenuItems>
                      {userData?.roles?.map((role) => (
                        <MenuItem key={role}>
                          <button
                            onClick={() => handleSwitchAccount(role)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              userData.activeRole === role ? "bg-gray-100" : ""
                            }`}
                          >
                            Switch to {role}
                          </button>
                        </MenuItem>
                      ))}
                      <MenuItem>
                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600">
                          Logout
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium tracking-tight uppercase hover:text-gray-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm font-medium tracking-tight uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="relative w-8 h-6 focus:outline-none group">
                <div
                  className={`absolute w-full h-0.5 bg-black transition-all duration-300 ${isOpen ? "rotate-45 top-1/2 -translate-y-1/2" : "top-0"}`}
                ></div>
                <div
                  className={`absolute w-full h-0.5 bg-black top-1/2 -translate-y-1/2 transition-opacity ${isOpen ? "opacity-0" : "opacity-100"}`}
                ></div>
                <div
                  className={`absolute w-full h-0.5 bg-black transition-all duration-300 ${isOpen ? "-rotate-45 bottom-1/2 translate-y-1/2" : "bottom-0"}`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed top-16 left-0 w-full bg-white border-b border-black/10 shadow-sm md:hidden animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-sm font-medium tracking-tight uppercase hover:bg-gray-100 py-2"
                >
                  Dashboard
                </Link>
                {userData?.roles?.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleSwitchAccount(role)}
                    className={`block w-full text-left text-sm font-medium tracking-tight uppercase hover:bg-gray-100 py-2 ${
                      userData.activeRole === role ? "bg-gray-100" : ""
                    }`}
                  >
                    Switch to {role}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="w-full text-left text-sm font-medium tracking-tight uppercase hover:bg-gray-100 py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block text-sm font-medium tracking-tight uppercase hover:bg-gray-100 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-sm font-medium tracking-tight uppercase border border-black px-3 py-2 text-center hover:bg-black hover:text-white transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* Bottom Navigation for Small Screens */}
      {user && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-black/10 shadow-sm md:hidden">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center">
              <FaUser className="text-2xl" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
            {userData?.activeRole === "student" && (
              <Link href="/dashboard/book" className="flex flex-col items-center">
                <FaBook className="text-2xl" />
                <span className="text-xs mt-1">Book Session</span>
              </Link>
            )}
            {userData?.activeRole === "mentor" && (
              <Link href="/dashboard/availability" className="flex flex-col items-center">
                <FaCalendar className="text-2xl" />
                <span className="text-xs mt-1">Availability</span>
              </Link>
            )}
            {userData?.activeRole === "admin" && (
              <Link href="/dashboard/admin" className="flex flex-col items-center">
                <FaCog className="text-2xl" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
            <Link href="/dashboard/sessions" className="flex flex-col items-center">
              <FaBook className="text-2xl" />
              <span className="text-xs mt-1">Sessions</span>
            </Link>
          </div>
        </div>
      )}
      {/* Padding to prevent content from being hidden */}
      <div className="h-16"></div>
      {user && <div className="h-16 md:h-0"></div>} {/* Extra padding for bottom nav on mobile */}
    </>
  )
}

