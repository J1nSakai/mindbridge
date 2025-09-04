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
            <form className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-neutral-950 font-bold text-lg"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
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
                  type="email"
                  placeholder="your@email.com"
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
                  type="password"
                  placeholder="Create a strong password"
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
                  type="password"
                  placeholder="Confirm your password"
                  required
                  className="h-12 text-lg font-bold border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:border-primary-500"
                />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary-500 text-neutral-50 font-bold text-lg border-4 border-neutral-950"
            >
              Create Account
            </Button>

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
                <a
                  href="#"
                  className="text-primary-600 font-black hover:text-primary-500 hover:-translate-y-1 transition-all inline-block"
                >
                  Login here
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
