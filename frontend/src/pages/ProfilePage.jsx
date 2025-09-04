import React from "react";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-neutral-950 mb-8">
          👤 Profile
        </h1>

        <div className="bg-white p-8 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-950 mb-2">
              {user?.name || "User"}
            </h2>
            <p className="text-neutral-600 font-bold mb-6">
              {user?.email || "user@example.com"}
            </p>

            <div className="text-left max-w-md mx-auto">
              <h3 className="text-xl font-bold text-neutral-950 mb-4">
                Account Info
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-bold">Level:</span> 1
                </p>
                <p>
                  <span className="font-bold">XP:</span> 0
                </p>
                <p>
                  <span className="font-bold">Joined:</span> Today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
