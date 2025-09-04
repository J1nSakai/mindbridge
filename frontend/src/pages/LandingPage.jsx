import React, { useEffect, useState } from "react";
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
  Gamepad2,
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-neutral-50 min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-primary-400 border-b-8 border-neutral-950">
        <div className="container mx-auto px-6 py-6">
          <nav
            className={`flex justify-between items-center mb-16 text-neutral-50 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-2 rounded-lg rotate-3 border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-6 hover:scale-110 transition-all duration-300 animate-pulse">
                <span className="text-3xl font-extrabold text-neutral-50">
                  MB
                </span>
              </div>
              <h1 className="text-3xl font-extrabold hover:scale-105 transition-transform duration-300">
                MindBridge
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform"
              >
                How It Works
              </a>
            </div>

            <div className="flex gap-4">
              <Button className="bg-neutral-950 text-neutral-50 font-bold py-6 px-6">
                Login
              </Button>
              <Button className="bg-primary-500 text-neutral-50 font-bold py-6 px-6">
                Sign Up
              </Button>
            </div>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div
              className={`lg:w-1/2 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="text-5xl md:text-6xl font-black leading-tight mb-6 hover:scale-105 transition-transform duration-500">
                Learn Faster with <HighlightedText>AI-Powered</HighlightedText>{" "}
                Learning
              </h2>
              <p className="text-xl mb-8 animate-fade-in-up">
                Transform your learning experience with MindBridge. Get
                summaries, flash cards, and interactive quizzes on any concept
                you find challenging.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-neutral-950 text-neutral-50 font-bold py-8 px-8 text-lg border-neutral-950 hover:scale-105 hover:-translate-y-1 hover:rotate-1 transition-all duration-300 animate-bounce-subtle">
                  Try For Free
                </Button>
                <Button className="bg-neutral-50 font-bold py-8 px-8 text-lg border-neutral-950 hover:scale-105 hover:-translate-y-1 hover:-rotate-1 transition-all duration-300">
                  Watch Demo
                </Button>
              </div>
            </div>

            <div
              className={`lg:w-1/2 relative transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="bg-primary-300 p-6 rounded-xl border-8 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-6 hover:scale-105 transition-all duration-500 animate-float">
                <img
                  src="https://placehold.co/600x400/primary-100/primary-800?text=AI+Learning+Experience"
                  alt="AI Learning Experience"
                  className="rounded-lg border-4 border-neutral-950 w-full hover:scale-105 transition-transform duration-300"
                  keywords="AI learning, education technology, mind map, learning platform"
                />
              </div>
              <div className="absolute -bottom-4 -left-6 animate-bounce-slow">
                <IconContainer
                  icon={BrainCircuit}
                  bgColor="bg-primary-200"
                  rotation="rotate-6"
                  position=""
                />
              </div>
              <div className="absolute -top-4 -right-4 animate-pulse">
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
      <section id="features" className="py-20 bg-neutral-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 text-center animate-fade-in-up hover:scale-105 transition-transform duration-300">
            How <HighlightedText>MindBridge</HighlightedText> Helps You Learn
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="animate-fade-in-up delay-100">
              <FeatureCard
                icon={NotepadText}
                title="Smart Summaries"
                description="Get concise, intelligent summaries of complex topics. Our AI breaks down difficult concepts into easy-to-understand explanations."
                bgColor="bg-primary-200"
                iconRotation="rotate-3"
              />
            </div>

            <div className="animate-fade-in-up delay-200">
              <FeatureCard
                icon={WalletCards}
                title="Flash Cards"
                description="Automatically generated flash cards help you memorize key information quickly. Perfect for studying before exams."
                bgColor="bg-primary-300"
                iconRotation="-rotate-3"
              />
            </div>

            <div className="animate-fade-in-up delay-300">
              <FeatureCard
                icon={BookOpenCheck}
                title="Interactive Quizzes"
                description="Test your knowledge with personalized quizzes that adapt to your learning progress and help identify areas for improvement."
                bgColor="bg-primary-400"
                iconRotation="rotate-6"
              />
            </div>

            <div className="animate-fade-in-up delay-400">
              <FeatureCard
                icon={Gamepad2}
                title="RPG Learning Game"
                description="Turn learning into an adventure with our 2D RPG game. Answer correctly to deal damage to enemies, but be careful - wrong answers will cost you!"
                bgColor="bg-primary-500"
                textColor="text-neutral-50"
                iconRotation="-rotate-6"
              />
            </div>

            <div className="animate-fade-in-up delay-500">
              <FeatureCard
                icon={TrendingUp}
                title="Progress Tracking"
                description="Monitor your learning journey with detailed analytics. See how you're improving and identify your strengths and weaknesses."
                bgColor="bg-primary-600"
                textColor="text-neutral-50"
                iconRotation="rotate-3"
              />
            </div>

            <div className="animate-fade-in-up delay-600">
              <FeatureCard
                icon={Bot}
                title="AI Tutor"
                description="Get personalized help from our AI tutor that understands your learning style and adapts to your needs."
                bgColor="bg-neutral-200"
                iconRotation="-rotate-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RPG Game Showcase */}
      <section className="py-20 bg-primary-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 animate-fade-in-left">
              <h2 className="text-4xl font-black mb-6 hover:scale-105 transition-transform duration-300">
                Learn Through <HighlightedText>Adventure</HighlightedText>
              </h2>
              <p className="text-xl mb-8 animate-fade-in-up delay-200">
                Our unique 2D RPG game turns boring study sessions into exciting
                adventures. Battle monsters by answering questions correctly,
                level up your character, and conquer difficult subjects!
              </p>

              <div className="bg-neutral-50 p-6 rounded-xl border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 hover:scale-105 transition-all duration-300 animate-fade-in-up delay-400">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 animate-slide-in-left delay-500 hover:translate-x-2 transition-transform duration-300">
                    <div className="bg-primary-500 p-1 rounded-md border-2 border-neutral-950 animate-pulse">
                      <Star className="text-neutral-50" />
                    </div>
                    <span className="font-bold">
                      Answer correctly to attack enemies
                    </span>
                  </li>
                  <li className="flex items-center gap-3 animate-slide-in-left delay-600 hover:translate-x-2 transition-transform duration-300">
                    <div className="bg-primary-500 p-1 rounded-md border-2 border-neutral-950 animate-pulse">
                      <Star className="text-neutral-50" />
                    </div>
                    <span className="font-bold">
                      Collect power-ups and special items
                    </span>
                  </li>
                  <li className="flex items-center gap-3 animate-slide-in-left delay-700 hover:translate-x-2 transition-transform duration-300">
                    <div className="bg-primary-500 p-1 rounded-md border-2 border-neutral-950 animate-pulse">
                      <Star className="text-neutral-50" />
                    </div>
                    <span className="font-bold">
                      Customize your character as you level up
                    </span>
                  </li>
                  <li className="flex items-center gap-3 animate-slide-in-left delay-800 hover:translate-x-2 transition-transform duration-300">
                    <div className="bg-primary-500 p-1 rounded-md border-2 border-neutral-950 animate-pulse">
                      <Star className="text-neutral-50" />
                    </div>
                    <span className="font-bold">
                      Compete with friends on the leaderboard
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:w-1/2 relative animate-fade-in-right">
              <div className="bg-primary-300 p-6 rounded-xl border-8 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 animate-float">
                <img
                  src="https://placehold.co/600x400/primary-200/primary-800?text=RPG+Game+Screenshot"
                  alt="RPG Learning Game Screenshot"
                  className="rounded-lg border-4 border-neutral-950 w-full hover:scale-105 transition-transform duration-300"
                  keywords="RPG game, educational game, learning game, 2D game"
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-neutral-300 p-4 rounded-lg border-4 border-neutral-950 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce-slow hover:rotate-45 transition-transform duration-300">
                <Mountain />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary-600 p-4 rounded-lg border-4 border-neutral-950 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse hover:-rotate-12 transition-transform duration-300">
                <Trophy className="text-neutral-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-neutral-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 text-center">
            How It <HighlightedText>Works</HighlightedText>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
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
              description="Choose how you want to study - read summaries, review flashcards, take quizzes, or play the RPG learning game."
              bgColor="bg-primary-300"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t-8 border-neutral-950 text-neutral-50">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary-500 p-2 rounded-lg rotate-3 border-4 border-neutral-50 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-2xl font-extrabold text-neutral-50">
                    MB
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold">MindBridge</h3>
              </div>
              <p className="text-lg mb-8 text-neutral-300 leading-relaxed">
                Transform your learning experience with AI-powered tools. Make
                studying fun with our{" "}
                <HighlightedText bgColor="bg-primary-500">
                  RPG learning game
                </HighlightedText>{" "}
                and intelligent study materials.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href="https://github.com/J1nSakai/mindbridge"
                  target="_blank"
                  className="bg-neutral-800 p-3 rounded-lg border-4 border-neutral-50 hover:-translate-y-1 hover:rotate-3 transition-transform shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <img
                    src={githubIcon}
                    alt="GitHub"
                    className="w-5 h-5 brightness-0 invert"
                  />
                </a>
                <a
                  href="https://linkedin.com/in/taimoor-abrejo"
                  target="_black"
                  className="bg-primary-600 p-3 rounded-lg border-4 border-neutral-50 hover:-translate-y-1 hover:rotate-6 transition-transform shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <img
                    src={linkedinIcon}
                    alt="LinkedIn"
                    className="w-5 h-5 brightness-0 invert"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-black mb-6 text-neutral-50">
                QUICK LINKS
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xl font-black mb-6 text-neutral-50">
                SUPPORT
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-300 font-bold hover:text-primary-400 hover:-translate-y-1 transition-all inline-block"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-4 border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="font-bold">Made with</span>
                <Heart className=" fill-current" />
                <span className="font-bold">for learners everywhere</span>
              </div>

              <div className="text-neutral-300 font-bold">
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
