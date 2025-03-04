"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
     <nav className="fixed top-0 left-0 w-full bg-white border-b border-black/10 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
            >
              Masai Connect
            </Link>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-8 h-6 focus:outline-none group"
              >
                <div className={`absolute w-full h-0.5 bg-black transition-all duration-300 ${isOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-0'}`}></div>
                <div className={`absolute w-full h-0.5 bg-black top-1/2 -translate-y-1/2 transition-opacity ${isOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className={`absolute w-full h-0.5 bg-black transition-all duration-300 ${isOpen ? '-rotate-45 bottom-1/2 translate-y-1/2' : 'bottom-0'}`}></div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-medium tracking-tight uppercase hover:text-gray-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium tracking-tight uppercase hover:text-gray-600 transition-colors"
                  >
                    Logout
                  </button>
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
                      <button
                        onClick={logout}
                        className="w-full text-left text-sm font-medium tracking-tight uppercase hover:bg-gray-100 py-2"
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
          </div>
        </div>
      </nav>
      {/* Padding to prevent content from being hidden */}
      <div className="h-16"></div>
    </>
  )
}

