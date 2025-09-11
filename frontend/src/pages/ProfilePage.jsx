import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const date = new Date(user?.registration);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-primary-100 p-4 sm:p-6 relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #87888c 1px, transparent 1px),
            linear-gradient(to bottom, #87888c 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col  sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8 px-2 sm:px-0 justify-between">
          <h1 className="text-2xl sm:text-3xl order-2 sm:order-1 lg:text-4xl font-extrabold text-text">
            Profile
          </h1>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary-400 border-border text-text order-1 sm:order-2 px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary-500 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
                {user?.name || "User"}
              </h2>
              <p className="text-sm sm:text-base text-text font-bold mb-4 sm:mb-6">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
