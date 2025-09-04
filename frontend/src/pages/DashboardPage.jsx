import React from "react";
import { useAuth } from "../contexts/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-neutral-950">
              Welcome back, {user?.name || "Learner"}! 🎓
            </h1>
            <p className="text-neutral-600 font-bold mt-2">
              Ready to continue your learning adventure?
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Study Card */}
          <div className="bg-white p-6 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              📚 Study
            </h2>
            <p className="text-neutral-600 mb-4">
              Generate AI-powered summaries, flashcards, and quizzes
            </p>
            <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-primary-600 transition-colors">
              Start Studying
            </button>
          </div>

          {/* Game Card */}
          <div className="bg-white p-6 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              🎮 Game
            </h2>
            <p className="text-neutral-600 mb-4">
              Battle monsters and level up your character
            </p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-600 transition-colors">
              Enter Battle
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              👤 Profile
            </h2>
            <p className="text-neutral-600 mb-4">
              View your progress and achievements
            </p>
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-600 transition-colors">
              View Profile
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white p-6 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold text-neutral-950 mb-4">
            📊 Quick Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500">0</div>
              <div className="text-neutral-600 font-bold">Study Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">1</div>
              <div className="text-neutral-600 font-bold">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">0</div>
              <div className="text-neutral-600 font-bold">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">0</div>
              <div className="text-neutral-600 font-bold">Battles Won</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
