import React from "react";
import {
  Clock,
  BookOpen,
  FileText,
  Calendar,
  Play,
} from "lucide-react";

export default function ExamCard({
  title = "Computer Networks",
  subject = "BCA Semester VI",
  duration = "60 Minutes",
  questions = 50,
  marks = 100,
  date = "28 July 2026",
  status = "Available",
  onStart,
}) {
  return (
    <div className="bg-[#171B22] border border-[#2B3140] rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-300">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          <p className="text-gray-400 mt-1">
            {subject}
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "Available"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>

      </div>

      {/* Details */}

      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="flex items-center gap-2 text-gray-300">
          <Clock size={18} />
          <span>{duration}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <BookOpen size={18} />
          <span>{questions} Questions</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <FileText size={18} />
          <span>{marks} Marks</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Calendar size={18} />
          <span>{date}</span>
        </div>

      </div>

      {/* Footer */}

      <div className="mt-6">

        <button
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >

          <Play size={18} />

          Start Exam

        </button>

      </div>

    </div>
  );
}