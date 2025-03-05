"use client"

import React, { useState, createContext, useContext } from "react"

// Create a context to share the isOpen state
const MenuContext = createContext(null)

export const Menu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </MenuContext.Provider>
  )
}

export const MenuButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { isOpen, setIsOpen } = useContext(MenuContext)
  
  return (
    <button 
      onClick={() => setIsOpen(!isOpen)} 
      className={className}
    >
      {children}
    </button>
  )
}

export const MenuItems = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useContext(MenuContext)
  
  if (!isOpen) return null
  
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
      <ul>
        {children}
      </ul>
    </div>
  )
}

export const MenuItem = ({ children }: { children: React.ReactNode }) => {
  return <li>{children}</li>
}