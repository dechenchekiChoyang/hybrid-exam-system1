import React from "react";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

export default function ProfileCard({ user }) {
  return (
    <div className="bg-[#171B22] border border-[#2B3140] rounded-2xl p-6 shadow-lg">

      {/* Profile Image */}

      <div className="flex flex-col items-center">

        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">

          {(user?.fullName || user?.name || "S")
            .charAt(0)
            .toUpperCase()}

        </div>

        <h2 className="mt-4 text-xl font-bold text-white">
          {user?.fullName || user?.name || "Student"}
        </h2>

        <span className="mt-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
          Student
        </span>

      </div>

      {/* Details */}

      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3">

          <Mail
            size={18}
            className="text-blue-400"
          />

          <div>

            <p className="text-gray-400 text-xs">
              Email
            </p>

            <p className="text-white">
              {user?.email || "Not Available"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Building2
            size={18}
            className="text-green-400"
          />

          <div>

            <p className="text-gray-400 text-xs">
              Department
            </p>

            <p className="text-white">
              {user?.department || "Computer Applications"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <GraduationCap
            size={18}
            className="text-yellow-400"
          />

          <div>

            <p className="text-gray-400 text-xs">
              Enrollment ID
            </p>

            <p className="text-white">
              {user?.enrollmentId || "N/A"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <BadgeCheck
            size={18}
            className="text-purple-400"
          />

          <div>

            <p className="text-gray-400 text-xs">
              Status
            </p>

            <p className="text-green-400 font-semibold">
              Active
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}