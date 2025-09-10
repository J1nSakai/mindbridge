import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import HighlightedText from "@/components/ui/HighlightedText";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinnerOnly } from "../components/ui/LoadingSpinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, error, clearError, authLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // if (isSubmitting) {
  //   return <LoadingSpinner message="Logging you in..." />;
  // }

  return (
    <div className="min-h-screen bg-primary-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
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
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary-500 p-2 sm:p-3 rounded-lg rotate-3 border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-bold text-neutral-50 text-base sm:text-lg">
                MD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text">
              MindBridge
            </h1>
          </div>
          <p className="text-sm sm:text-base text-text font-bold px-2">
            Welcome back to your{" "}
            <HighlightedText>learning adventure</HighlightedText>!
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text">
              Login to Your Account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-text font-bold px-2">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-text font-bold text-base sm:text-lg"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-10 sm:h-12 text-base sm:text-lg font-bold border-border"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-text font-bold text-base sm:text-lg"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-10 sm:h-12 text-base sm:text-lg font-bold border-border"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={authLoading}
                className="w-full bg-primary-400 text-text font-bold text-base sm:text-lg  border-border disabled:opacity-50 h-10 sm:h-12"
              >
                {authLoading ? (
                  <LoadingSpinnerOnly message="Logging in..." />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className="text-center pt-2 sm:pt-4">
              <p className="text-sm sm:text-base text-text font-bold">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-500 font-black hover:text-primary-600 hover:-translate-y-1 transition-all inline-block"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
