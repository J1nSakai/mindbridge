import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { aiAPI, userAPI } from "../services/api";
import { Button } from "../components/ui/button";
import {
  Brain,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Home,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingSpinnerOnly } from "@/components/ui/LoadingSpinner";
import HighlightedText from "@/components/ui/HighlightedText";

const StudyPage = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  // Study flow states
  const [currentStep, setCurrentStep] = useState("input"); // input, study, quiz, complete
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(5); // New state for question count

  // Session data states to store information from each step
  const [summarySessionData, setSummarySessionData] = useState(null);
  const [flashcardsSessionData, setFlashcardsSessionData] = useState(null);

  // Content states
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState(null);

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipStates, setCardFlipStates] = useState({}); // Track flip state for each card

  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      console.log("🚀 Starting learning journey for:", topic);

      // Generate summary first
      console.log("📝 Generating summary...");
      const summaryResponse = await aiAPI.generateSummary(topic, difficulty);
      setSummary(summaryResponse);

      // Generate flashcards
      console.log("🃏 Generating flashcards...");
      const flashcardsResponse = await aiAPI.generateFlashcards(
        topic,
        8,
        difficulty
      );
      setFlashcards(flashcardsResponse.flashcards || []);

      // Move to study step (summary + flashcards)
      setCurrentStep("study");
      console.log("✅ All content generated successfully!");
    } catch (error) {
      console.error("❌ Failed to generate content:", error);
      alert("Failed to generate study content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // This function will now collect session data instead of recording it immediately
  const collectSessionData = (stepType, sessionData) => {
    console.log(`✅ Collected ${stepType} session data for ${topic}`);
    return {
      type: stepType,
      duration: sessionData.duration || 5,
      score: sessionData.score || null,
      questionsAnswered: sessionData.questionsAnswered || null,
      correctAnswers: sessionData.correctAnswers || null,
      summary: sessionData.summary || null,
      flashcards: sessionData.flashcards || null,
    };
  };

  // This function will record the complete study session after quiz completion
  const recordCompleteSession = async (
    summaryData,
    flashcardsData,
    quizData
  ) => {
    try {
      console.log("📊 Session data:", {
        summaryData,
        flashcardsData,
        quizData,
      });

      // Record a single comprehensive study session
      const sessionPayload = {
        userId,
        topic,
        type: "complete", // New session type that includes all steps
        totalQuestions: questionCount,
        questionsAnswered: quizData.questionsAnswered,
        correctAnswers: quizData.correctAnswers,
        generatedSummary: summary.summary,
        flashCards: JSON.stringify(flashcards),
        quizData: JSON.stringify(quiz.questions),
        selectedQuizAnswers: JSON.stringify(selectedAnswers),
      };

      console.log(quiz);

      console.log("📤 Sending session payload:", sessionPayload);

      const response = await userAPI.recordStudySession(sessionPayload);
      console.log(`✅ Recorded complete study session for ${topic}:`, response);
    } catch (error) {
      console.error(`❌ Failed to record complete study session:`, error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const startQuiz = async () => {
    // Store summary and flashcards session data in state instead of recording immediately
    const summarySessionData = collectSessionData("summary", { duration: 5 });
    const flashcardsSessionData = collectSessionData("flashcards", {
      duration: 10,
    });

    // Save session data to state for later use
    setSummarySessionData(summarySessionData);
    setFlashcardsSessionData(flashcardsSessionData);

    // Generate quiz with selected question count
    console.log("❓ Generating quiz...");
    const quizResponse = await aiAPI.generateQuiz(
      topic,
      questionCount,
      difficulty
    );
    setQuiz(quizResponse);
    setCurrentStep("quiz");
  };

  const finishQuiz = async () => {
    console.log(selectedAnswers);

    // Calculate quiz results
    const correctAnswers = Object.entries(selectedAnswers).filter(
      ([questionIndex, answer]) =>
        quiz.questions[parseInt(questionIndex)]?.correctAnswer === answer
    ).length;

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    setQuizScore(score);

    // Collect quiz session data
    const quizSessionData = collectSessionData("quiz", {
      duration: 15,
      score,
      questionsAnswered: quiz.questions.length,
      correctAnswers,
    });

    // Now record the complete session with data from all steps
    await recordCompleteSession(
      summarySessionData,
      flashcardsSessionData,
      quizSessionData
    );

    setCurrentStep("complete");
  };

  const resetStudy = () => {
    setCurrentStep("input");
    setTopic("");
    setSummary(null);
    setFlashcards([]);
    setQuiz(null);
    setCurrentCardIndex(0);
    setCardFlipStates({});
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizScore(0);
    setSummarySessionData(null);
    setFlashcardsSessionData(null);
  };

  const toggleCardFlip = (cardIndex) => {
    console.log("Flipping card", cardIndex);
    setCardFlipStates((prev) => ({
      ...prev,
      [cardIndex]: !prev[cardIndex],
    }));
    console.log("New flip state:", !cardFlipStates[cardIndex]);
  };

  // Render input step
  if (currentStep === "input") {
    return (
      <div className="min-h-screen bg-primary-100 p-6 relative">
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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-neutral-950 mb-4">
              What do you want to{" "}
              <HighlightedText bgColor="bg-primary-500">learn</HighlightedText>?
            </h1>
            <p className="text-xl text-neutral-600 font-bold">
              Enter any topic you'd like to understand better
            </p>
          </div>

          <Card className="p-8 bg-primary-200">
            <CardContent>
              <form onSubmit={handleTopicSubmit} className="space-y-6">
                <div>
                  <Label className="block text-xl font-bold text-neutral-950 mb-3">
                    Topic or Question
                  </Label>
                  <Input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., How do React hooks work? or JavaScript closures"
                    className="w-full text-lg  border-neutral-950 rounded-lg font-bold focus:outline-none focus-visible:border-primary-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="block text-xl font-bold text-neutral-950 mb-3">
                    Difficulty Level
                  </Label>
                  <Select
                    value={difficulty}
                    onChange={(value) => setDifficulty(value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full text-lg  bg-white border-neutral-950  rounded-lg font-bold focus:outline-none focus-visible:border-primary-500">
                      <SelectValue placeholder="Select a difficulty level" />
                    </SelectTrigger>
                    <SelectContent className={"bg-neutral-50"}>
                      <SelectGroup>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={!topic.trim() || loading}
                  className="w-full bg-primary-400 text-neutral-50 font-bold text-xl py-4 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <LoadingSpinnerOnly message="Generating Content..." />
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2" />
                      Start Learning
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render study step (summary + flashcards)
  if (currentStep === "study") {
    return (
      <div className="min-h-screen bg-primary-100 p-6 relative">
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
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className=" flex flex-row  items-center justify-center text-4xl font-black text-neutral-950">
              <BookOpen className="mr-2" size={40} /> Study: {topic}
            </h1>
            <Button
              onClick={() => setCurrentStep("input")}
              className="bg-neutral-300 text-neutral-950 font-bold px-4 py-2"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>

          <div className="flex flex-col gap-8">
            {/* Summary Section */}
            <div>
              <h2 className="text-3xl font-black text-neutral-950 mb-6">
                Summary
              </h2>
              <Card className="p-6 bg-primary-100 h-fit">
                <CardContent>
                  <Markdown>{summary?.summary}</Markdown>
                </CardContent>
              </Card>
            </div>

            {/* Flashcards Section */}
            <div className="select-none">
              <h2 className="text-3xl font-black text-neutral-950 mb-6">
                Flashcards
              </h2>

              {flashcards.length > 0 && (
                <>
                  <div className="text-center mb-4 ">
                    <span className="text-lg font-bold text-neutral-600">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </span>
                  </div>
                  <div onClick={() => toggleCardFlip(currentCardIndex)}>
                    <Card
                      className={`p-8 mb-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        cardFlipStates[currentCardIndex]
                          ? "bg-primary-400"
                          : "bg-primary-200"
                      }`}
                    >
                      <div className="text-center min-h-[150px] flex items-center justify-center">
                        <div className="text-xl font-bold text-neutral-950">
                          {cardFlipStates[currentCardIndex]
                            ? flashcards[currentCardIndex]?.back
                            : flashcards[currentCardIndex]?.front}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <span className="text-sm font-bold text-neutral-600">
                          Click to{" "}
                          {cardFlipStates[currentCardIndex]
                            ? "see question"
                            : "reveal answer"}
                        </span>
                      </div>
                    </Card>
                  </div>

                  {/* Flashcard Navigation */}
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      onClick={() => {
                        if (currentCardIndex > 0) {
                          setCurrentCardIndex(currentCardIndex - 1);
                        }
                      }}
                      disabled={currentCardIndex === 0}
                      className="bg-neutral-300 text-neutral-950 font-bold px-4 py-2"
                    >
                      <ArrowLeft className="mr-2" />
                      Previous
                    </Button>

                    <Button
                      onClick={() => {
                        if (currentCardIndex < flashcards.length - 1) {
                          setCurrentCardIndex(currentCardIndex + 1);
                        }
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="bg-primary-500 text-neutral-50 font-bold px-4 py-2"
                    >
                      Next
                      <ArrowRight className="ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="text-center mt-12">
            <Card className="p-8 bg-primary-300">
              <h3 className="text-2xl font-black text-neutral-950 mb-4">
                Ready to test your knowledge?
              </h3>
              <p className="text-lg text-neutral-600 font-bold mb-6">
                Take the quiz to see how much you've learned! <br />
                <span>
                  Note: This topic will only be saved for you{" "}
                  <HighlightedText bgColor="bg-primary-500">
                    AFTER
                  </HighlightedText>{" "}
                  completing the quiz.
                </span>
              </p>

              {/* Question Count Selector */}
              <div className="mb-6">
                <label className="block text-xl font-bold text-neutral-950 mb-3">
                  Number of Questions
                </label>
                <div className="flex justify-center gap-4">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-6 py-3 text-lg font-bold border-4 border-neutral-950 rounded-lg transition-all duration-300 ${
                        questionCount === count
                          ? "bg-primary-500 text-neutral-50 scale-105"
                          : "bg-neutral-50 text-neutral-950 hover:bg-primary-100"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="bg-neutral-950 text-neutral-50 font-bold text-xl px-8 py-4 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              >
                <Target className="mr-2" />
                Start Quiz with {questionCount} Questions
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render quiz step
  if (currentStep === "quiz") {
    const currentQuestion = quiz?.questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-primary-100 p-6 relative">
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl underline font-black text-neutral-950">
              Quiz: {topic}
            </h1>
            <Button
              onClick={() => setCurrentStep("study")}
              className="bg-neutral-300 text-neutral-950 font-bold px-4 py-2"
            >
              <ArrowLeft className="mr-2" />
              Back to Study
            </Button>
          </div>

          <div className="text-center mb-6">
            <span className="text-lg font-bold text-neutral-600">
              Question {currentQuestionIndex + 1} of {quiz?.questions.length}
            </span>
          </div>

          <Card className="p-8 mb-8 bg-primary-100">
            <h2 className="text-2xl font-bold text-neutral-950 mb-6">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion?.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected =
                  selectedAnswers[currentQuestionIndex] === optionLetter;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestionIndex]: optionLetter,
                      })
                    }
                    className={`w-full p-4 text-left border-4 border-neutral-950 rounded-lg font-bold transition-all duration-300 ${
                      isSelected
                        ? "bg-primary-300 scale-105"
                        : "bg-neutral-50 hover:bg-primary-100"
                    }`}
                  >
                    <span className="font-black text-neutral-950 mr-3">
                      {optionLetter}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="bg-neutral-300 text-neutral-950 font-bold px-6 py-3"
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>

            <div className="flex gap-4">
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="bg-primary-500 text-neutral-50 font-bold px-6 py-3"
                >
                  Next Question
                  <ArrowRight className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={finishQuiz}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="bg-neutral-950 text-neutral-50 font-bold px-6 py-3 hover:scale-105 transition-all duration-300"
                >
                  Finish Quiz
                  <CheckCircle className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render completion step
  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-primary-100 p-6 relative">
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
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-12">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-5xl font-black text-neutral-950 mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-neutral-600 font-bold">
              You've completed your study session on "{topic}"
            </p>
          </div>

          <Card className="p-8 mb-8 bg-primary-200">
            <h2 className="text-3xl font-black text-neutral-950 mb-6">
              Your Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-neutral-50">
                <div className="text-4xl font-black text-primary-500 mb-2">
                  {quizScore}%
                </div>
                <div className="font-bold text-neutral-950">Quiz Score</div>
              </Card>

              <Card className="p-6 bg-neutral-50">
                <div className="text-4xl font-black text-primary-600 mb-2">
                  {flashcards.length}
                </div>
                <div className="font-bold text-neutral-950">Cards Studied</div>
              </Card>

              <Card className="p-6 bg-neutral-50">
                <div className="text-4xl font-black text-neutral-950 mb-2">
                  3
                </div>
                <div className="font-bold text-neutral-950">Activities</div>
              </Card>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              onClick={resetStudy}
              className="bg-primary-500 text-neutral-50 font-bold px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="mr-2" />
              Study Another Topic
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-neutral-950 text-neutral-50 font-bold px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              <Home className="mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudyPage;
