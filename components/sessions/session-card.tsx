"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FaCalendarAlt, FaClock, FaCode ,FaUser, FaLink, FaVideo, FaTimes, FaCheck, FaExclamation } from "react-icons/fa";

export default function SessionCard({ session, userRole }) {
  const [status, setStatus] = useState(session.status);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const now = new Date();
  const isPast = endTime < now;

  useEffect(() => {
    const roomName = `masai-session-${session.id}`;
    const jitsiLink = `https://meet.jit.si/${roomName}`;
    setMeetingLink(jitsiLink);
  }, [session.id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    setError("");
    try {
      await updateDoc(doc(db, "sessions", session.id), { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating session status:", error);
      setError("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    const fiveHoursBeforeStart = new Date(startTime.getTime() - 5 * 60 * 60 * 1000);
    if (now > fiveHoursBeforeStart) {
      setError("Cancellation only allowed 5+ hours before start.");
      return;
    }
    setUpdating(true);
    setError("");
    try {
      await updateDoc(doc(db, "sessions", session.id), { status: "cancelled" });
      setStatus("cancelled");
    } catch (error) {
      console.error("Error cancelling session:", error);
      setError("Failed to cancel session.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md border border-gray-100 max-w-sm w-full transition-all duration-300 hover:shadow-lg">
      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-xs mb-3 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
          <FaExclamation /> {error}
        </p>
      )}

      {/* Session Details */}
      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p className="flex items-center gap-2">
          <span className="font-medium text-indigo-700">Status:</span>
          <span className={`capitalize ${status === "cancelled" ? "text-red-600" : status === "completed" ? "text-green-600" : "text-gray-600"}`}>
            {status}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <FaUser className="text-indigo-500" />
          <span className="font-medium">{userRole === "student" ? "Mentor" : "Student"}:</span>
          <span>{userRole === "student" ? session.mentorName : session.studentName}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaCode className="text-indigo-500" />
          <span className="font-medium">Course:</span> <span>{session.course}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaCalendarAlt className="text-indigo-500" />
          <span className="font-medium">Date:</span> <span>{startTime.toLocaleDateString()}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaClock className="text-indigo-500" />
          <span className="font-medium">Time:</span> 
          <span>{startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Meeting Link */}
      {meetingLink && (
        <div className="mb-4">
          <p className="text-sm font-medium text-indigo-700 mb-1 flex items-center gap-2">
            <FaLink className="text-indigo-500" /> Meeting Link
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meetingLink}
              readOnly
              className="flex-1 bg-gray-50 text-gray-600 text-xs px-3 py-2 rounded-md border border-gray-200 truncate focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-500 text-white px-3 py-2 rounded-md text-xs hover:bg-indigo-600 transition-all duration-300 flex items-center gap-1"
            >
              <FaVideo /> Join
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
              className="w-full bg-red-500 text-white text-sm py-2 rounded-md hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes /> {updating ? "Cancelling..." : "Cancel"}
            </button>
          )}
          {userRole === "mentor" && isPast && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus("completed")}
                disabled={updating}
                className="flex-1 bg-green-500 text-white text-sm py-2 rounded-md hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCheck /> Completed
              </button>
              <button
                onClick={() => handleUpdateStatus("no-show")}
                disabled={updating}
                className="flex-1 bg-amber-500 text-white text-sm py-2 rounded-md hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaExclamation /> No-Show
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}