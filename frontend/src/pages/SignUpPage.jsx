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
import LoadingSpinner from "../components/ui/LoadingSpinner";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) clearError();
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner message="Creating your account..." />;
  }

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
            Start your <HighlightedText>learning adventure</HighlightedText>{" "}
            today!
          </p>
        </div>

        {/* SignUp Card */}
        <Card className="w-full max-w-md bg-neutral-50 border-8 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-neutral-950">
              Create your account
            </CardTitle>
            <CardDescription className="text-neutral-600 font-bold">
              Join thousands of learners and begin your journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            {(error || validationError) && (
              <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-bold">
                  {error || validationError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-neutral-950 font-bold text-lg"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>

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
                <Label
                  htmlFor="password"
                  className="text-neutral-950 font-bold text-lg"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-neutral-950 font-bold text-lg"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>

              {/* Submit button inside form */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary-500 text-neutral-50 font-bold text-lg border-4 border-neutral-950 hover:bg-primary-600 disabled:opacity-50"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Button
              type="button"
              variant="neutral"
              size="lg"
              className="w-full font-bold text-lg border-4 border-neutral-950"
            >
              Sign up with Google
            </Button>

            <div className="text-center pt-4">
              <p className="text-neutral-700 font-bold">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-black hover:text-primary-500 hover:-translate-y-1 transition-all inline-block"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
