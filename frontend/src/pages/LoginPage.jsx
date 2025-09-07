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
import LoadingSpinner, {
  LoadingSpinnerOnly,
} from "../components/ui/LoadingSpinner";

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
    <div className="min-h-screen bg-primary-100 flex items-center justify-center p-6 relative">
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
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary-500 p-3 rounded-lg rotate-3 border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-bold text-lg">MD</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-950">
              MindBridge
            </h1>
          </div>
          <p className="text-neutral-700 font-bold">
            Welcome back to your{" "}
            <HighlightedText>learning adventure</HighlightedText>!
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md bg-neutral-50 border-8 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-neutral-950">
              Login to your account
            </CardTitle>
            <CardDescription className="text-neutral-600 font-bold">
              Enter your credentials to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-neutral-950 font-bold text-lg"
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
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-neutral-950 font-bold text-lg"
                  >
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-primary-600 font-bold hover:text-primary-500 hover:-translate-y-1 transition-all text-sm"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>

              {/* Submit button inside form */}
              <Button
                type="submit"
                size="lg"
                disabled={authLoading}
                className="w-full bg-primary-500 text-neutral-50 font-bold text-lg border-4 border-neutral-950 hover:bg-primary-600 disabled:opacity-50"
              >
                {authLoading ? (
                  <LoadingSpinnerOnly message="Logging you in..." />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="text-center pt-4">
              <p className="text-neutral-700 font-bold">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-600 font-black hover:text-primary-500 hover:-translate-y-1 transition-all inline-block"
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
