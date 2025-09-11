import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/ui/FeatureCard";
import HighlightedText from "@/components/ui/HighlightedText";
import HowItWorksStep from "@/components/ui/HowItWorksStep";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { BookOpenCheck, Heart, NotepadText, WalletCards } from "lucide-react";
import LinkedIn from "@/assets/social_icons/LinkedIn";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-background min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-background border-b-8 border-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <nav
            className={`flex justify-between items-center mb-12 sm:mb-16 text-neutral-50 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-border shadow-shadow sm:shadow-shadow hover:rotate-6 hover:scale-110 transition-all duration-300">
                <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-neutral-50">
                  MB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl text-text font-extrabold">
                MindBridge
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a
                href="#features"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform text-sm text-text lg:text-base"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-bold hover:underline hover:-translate-y-1 transition-transform text-text text-sm lg:text-base"
              >
                How It Works
              </a>
            </div>

            <div className="flex gap-2 sm:gap-4">
              <ThemeToggle />
              <Button
                onClick={() => navigate("/login")}
                className={
                  "bg-primary-500 text-text font-bold py-3 sm:py-6 px-3 sm:px-6 transition text-xs sm:text-sm"
                }
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-primary-600 text-text font-bold py-3 sm:py-6 px-3 sm:px-6 transition text-xs sm:text-sm"
              >
                Sign Up
              </Button>
            </div>
          </nav>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16 min-h-[60vh]">
            <div
              className={`lg:w-1/2 transition-all text-center ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 sm:mb-8 transition-transform duration-500">
                Bridge the Gap to{" "}
                <HighlightedText className="text-primary-600">
                  Smarter Learning
                </HighlightedText>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 lg:mb-12 text-text leading-relaxed px-4 sm:px-0">
                Transform any topic into personalized study materials with AI.
                Generate summaries, flashcards, and quizzes instantly to
                accelerate your learning journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 px-4 sm:px-0 justify-center">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-primary-400 text-text font-bold py-3 sm:py-4 lg:py-6 px-6 sm:px-8 text-sm sm:text-base lg:text-lg border-border "
                >
                  Try For Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="py-12 sm:py-16 lg:py-24 bg-secondary-background border-b-border border-b-8"
      >
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
              bgColor="bg-primary-200"
              textColor="text-text"
            />

            <FeatureCard
              icon={WalletCards}
              title="Flash Cards"
              description="Create interactive flashcards automatically from your study materials to reinforce learning through spaced repetition."
              bgColor="bg-primary-200"
              textColor="text-text"
            />

            <FeatureCard
              icon={BookOpenCheck}
              title="Interactive Quizzes"
              description="Test your knowledge with dynamically generated quizzes that adapt to your learning progress and identify weak areas."
              bgColor="bg-primary-200"
              textColor="text-text"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 lg:py-24 bg-primary-50 border-b-border border-b-8"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
            How It <HighlightedText>Works</HighlightedText>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <HowItWorksStep
              stepNumber={1}
              title="Input Your Topic"
              description="Tell MindBridge what you're struggling with. Enter any concept, subject, or question you need help understanding."
              bgColor="bg-primary-200"
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
              bgColor="bg-primary-200"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-background  border-border">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center justify-center gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
            {/* Brand Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-border shadow-shadow sm:shadow-shadow hover:rotate-6 hover:scale-110 transition-all duration-300">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-neutral-50">
                    MB
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-text">
                  MindBridge
                </h3>
              </div>
              <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-text leading-relaxed">
                Transform your learning experience with AI-powered tools.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="https://github.com/J1nSakai/mindbridge"
                  target="_blank"
                >
                  <Button className="bg-primary-400 border-border text-text px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto">
                    <Github />
                  </Button>
                </a>
                <a
                  href="https://linkedin.com/in/taimoor-abrejo"
                  target="_black"
                >
                  <Button className="bg-primary-400 border-border text-text px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto">
                    <LinkedIn />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 sm:border-t-4 border-neutral-800 pt-6 sm:pt-8">
            <div className="flex justify-center items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-text">
                <span className="font-bold text-sm sm:text-base">
                  Made with
                </span>
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span className="font-bold text-sm sm:text-base">
                  for learners everywhere
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
