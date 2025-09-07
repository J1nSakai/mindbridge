import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import HighlightedText from "@/components/ui/HighlightedText";
import FeatureCard from "@/components/ui/FeatureCard";
import HowItWorksStep from "@/components/ui/HowItWorksStep";
import IconContainer from "@/components/ui/IconContainer";

import githubIcon from "@/assets/social_icons/github.svg";
import linkedinIcon from "@/assets/social_icons/linkedin.svg";
import {
  BookOpenCheck,
  Bot,
  BrainCircuit,
  GraduationCap,
  Heart,
  Mountain,
  NotepadText,
  Star,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-neutral-50 min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-primary-400 border-b-8 border-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <nav
            className={`flex justify-between items-center mb-12 sm:mb-16 text-neutral-50 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-6 hover:scale-110 transition-all duration-300">
                <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-neutral-50">
                  MB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold transition-transform duration-300">
                MindBridge
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a
                href="#features"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform text-sm lg:text-base"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform text-sm lg:text-base"
              >
                How It Works
              </a>
            </div>

            <div className="flex gap-2 sm:gap-4">
              <Button
                onClick={() => navigate("/login")}
                className={
                  "bg-neutral-950 text-neutral-50 font-bold py-3 sm:py-6 px-3 sm:px-6 hover:bg-neutral-800 transition text-xs sm:text-sm"
                }
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-primary-500 text-neutral-50 font-bold py-3 sm:py-6 px-3 sm:px-6 hover:bg-primary-600 transition text-xs sm:text-sm"
              >
                Sign Up
              </Button>
            </div>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
            <div
              className={`lg:w-1/2 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 sm:mb-8 transition-transform duration-500">
                Bridge the Gap to <HighlightedText className="text-primary-600">Smarter Learning</HighlightedText>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 lg:mb-12 text-neutral-700 leading-relaxed px-4 sm:px-0">
                Transform any topic into personalized study materials with AI.
                Generate summaries, flashcards, and quizzes instantly to accelerate
                your learning journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 px-4 sm:px-0">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-primary-500 hover:bg-primary-600 text-neutral-50 font-bold py-3 sm:py-4 lg:py-6 px-6 sm:px-8 text-sm sm:text-base lg:text-lg border-2 sm:border-4 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:rotate-3 transition-transform"
                >
                  Try For Free
                </Button>
                <Button className="bg-neutral-50 font-bold py-3 sm:py-4 lg:py-6 px-6 sm:px-8 text-sm sm:text-base lg:text-lg border-2 sm:border-4 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-rotate-1 transition-transform">
                  Watch Demo
                </Button>
              </div>
            </div>

            <div
              className={`lg:w-1/2 relative transition-all duration-1000 delay-500 px-4 sm:px-0 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="bg-primary-300 p-4 sm:p-6 rounded-lg sm:rounded-xl border-4 sm:border-6 lg:border-8 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-6 hover:scale-105 transition-all duration-500 animate-float">
                <img
                  src="https://placehold.co/600x400/primary-100/primary-800?text=AI+Learning+Experience"
                  alt="AI Learning Experience"
                  className="rounded-md sm:rounded-lg border-2 sm:border-3 lg:border-4 border-neutral-950 w-full hover:scale-105 transition-transform duration-300"
                  keywords="AI learning, education technology, mind map, learning platform"
                />
              </div>
              <div className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 -left-3 sm:-left-4 lg:-left-6 animate-bounce-slow">
                <IconContainer
                  icon={BrainCircuit}
                  bgColor="bg-primary-200"
                  rotation="rotate-6"
                  position=""
                />
              </div>
              <div className="absolute -top-2 sm:-top-3 lg:-top-4 -right-2 sm:-right-3 lg:-right-4 animate-pulse">
                <IconContainer
                  icon={GraduationCap}
                  bgColor="bg-primary-600"
                  rotation="-rotate-12"
                  position=""
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
            Powerful <HighlightedText>Features</HighlightedText> for Effective
            Learning
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={NotepadText}
              title="Smart Summaries"
              description="Get concise, AI-generated summaries of complex topics that highlight the most important concepts and key takeaways."
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
              delay={200}
            />

            <FeatureCard
              icon={WalletCards}
              title="Flash Cards"
              description="Create interactive flashcards automatically from your study materials to reinforce learning through spaced repetition."
              bgColor="bg-green-100"
              iconColor="text-green-600"
              delay={400}
            />

            <FeatureCard
              icon={BookOpenCheck}
              title="Interactive Quizzes"
              description="Test your knowledge with dynamically generated quizzes that adapt to your learning progress and identify weak areas."
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
            How It <HighlightedText>Works</HighlightedText>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <HowItWorksStep
              stepNumber={1}
              title="Input Your Topic"
              description="Tell MindBridge what you're struggling with. Enter any concept, subject, or question you need help understanding."
              bgColor="bg-neutral-200"
            />

            <HowItWorksStep
              stepNumber={2}
              title="AI Creates Materials"
              description="Our advanced AI generates personalized learning materials including summaries, flashcards, and quizzes."
              bgColor="bg-primary-200"
            />

            <HowItWorksStep
              stepNumber={3}
              title="Learn Your Way"
              description="Choose how you want to study - read summaries, review flashcards, or take quizzes to test your knowledge."
              bgColor="bg-primary-300"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t-4 sm:border-t-6 lg:border-t-8 border-neutral-950 text-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-neutral-50 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-lg sm:text-xl lg:text-2xl font-extrabold text-neutral-50">
                    MB
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold">MindBridge</h3>
              </div>
              <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-neutral-300 leading-relaxed">
                Transform your learning experience with AI-powered tools. Make
                studying effective with our intelligent study materials and
                personalized learning approach.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="https://github.com/J1nSakai/mindbridge"
                  target="_blank"
                  className="bg-neutral-800 p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-50 hover:-translate-y-1 hover:rotate-3 transition-transform shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <img
                    src={githubIcon}
                    alt="GitHub"
                    className="w-4 sm:w-5 h-4 sm:h-5 brightness-0 invert"
                  />
                </a>
                <a
                  href="https://linkedin.com/in/taimoor-abrejo"
                  target="_black"
                  className="bg-primary-600 p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-50 hover:-translate-y-1 hover:rotate-6 transition-transform shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <img
                    src={linkedinIcon}
                    alt="LinkedIn"
                    className="w-4 sm:w-5 h-4 sm:h-5 brightness-0 invert"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 text-neutral-50">
                QUICK LINKS
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 text-neutral-50">
                SUPPORT
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 sm:border-t-4 border-neutral-800 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="font-bold text-sm sm:text-base">Made with</span>
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span className="font-bold text-sm sm:text-base">for learners everywhere</span>
              </div>

              <div className="text-neutral-300 font-bold text-sm sm:text-base">
                © 2024 MindBridge. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
