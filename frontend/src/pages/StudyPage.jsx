import Star4 from "@/components/stars/s4";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import HighlightedText from "@/components/ui/HighlightedText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinnerOnly } from "@/components/ui/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Home,
  RotateCcw,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { aiAPI, userAPI } from "../services/api";
import ThemeToggle from "../components/ui/ThemeToggle";

const StudyPage = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  // Study flow states
  const [currentStep, setCurrentStep] = useState("input"); // input, study, quiz, complete
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [startQuizLoading, setStartQuizLoading] = useState(false);
  const [finishQuizLoading, setFinishQuizLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(5); // New state for question count

  // Session data states to store information from each step
  const [summarySessionData, setSummarySessionData] = useState(null);
  const [flashcardsSessionData, setFlashcardsSessionData] = useState(null);

  // Content states
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState(null);

  // Flashcard states
  const [cardFlipStates, setCardFlipStates] = useState({}); // Track flip state for each card
  const [flipped, setFlipped] = useState(false);

  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Carousel state
  const [emblaApi, setEmblaApi] = useState();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const currIndex = emblaApi.selectedScrollSnap();

      // Optional: detect swipe direction
      console.log("Current slide:", currIndex);
    };

    // Add the event listener
    emblaApi.on("select", onSelect);

    // Cleanup function
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

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
    setStartQuizLoading(true);
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
    setStartQuizLoading(false);
  };

  const finishQuiz = async () => {
    setFinishQuizLoading(true);
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
    setCorrectAnswers(correctAnswers);
    setCurrentStep("complete");
    setFinishQuizLoading(false);
  };

  const resetStudy = () => {
    setCurrentStep("input");
    setTopic("");
    setSummary(null);
    setFlashcards([]);
    setQuiz(null);
    setCardFlipStates({});
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizScore(0);
    setSummarySessionData(null);
    setFlashcardsSessionData(null);
  };

  const toggleCardFlip = (index) => {
    setTimeout(
      () =>
        setCardFlipStates((prev) => ({
          ...prev,
          [index]: !prev[index],
        })),
      400
    );
    setFlipped(true);
    setTimeout(() => setFlipped(false), 800); // reset after animation ends
  };

  // Render input step
  if (currentStep === "input") {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 relative">
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
          {/* Header with Back Button and Theme Toggle */}
          <div className="mb-6 sm:mb-8 flex justify-between items-center">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-primary-400 px-3 sm:px-4 py-2 text-text sm:py-3 w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text mb-3 sm:mb-4">
              What do you want to{" "}
              <HighlightedText bgColor="bg-primary-500">learn</HighlightedText>?
            </h1>
            <p className="text-lg sm:text-xl text-text font-bold px-4">
              Enter any topic you'd like to understand better
            </p>
          </div>

          <Card className="p-4 sm:p-6 lg:p-8 bg-primary-200">
            <CardContent>
              <form
                onSubmit={handleTopicSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <Label className="block text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3">
                    Topic or Question
                  </Label>
                  <Input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., How do React hooks work? or JavaScript closures"
                    className="w-full text-base sm:text-lg border-border rounded-lg font-bold focus:outline-none"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="block text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3">
                    Difficulty Level
                  </Label>
                  <Select
                    value={difficulty}
                    onChange={(value) => setDifficulty(value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full bg-secondary-background text-text text-base sm:text-lg border-border rounded-lg font-bold focus:outline-none focus-visible:border-primary-500">
                      <SelectValue placeholder="Select a difficulty level" />
                    </SelectTrigger>
                    <SelectContent
                      className={"bg-secondary-background text-text"}
                    >
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
                  className="w-full bg-primary-400 text-text font-bold text-lg sm:text-xl py-3 sm:py-4"
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
      <div className="min-h-screen bg-background p-4 sm:p-6 relative">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h1 className=" flex flex-row  items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-black text-text">
              <BookOpen className="mr-2" size={40} /> Study: {topic}
            </h1>
            <Button
              onClick={() => {
                setCurrentStep("input");
                resetStudy();
              }}
              className="bg-primary-400 text-text font-bold px-3 sm:px-4 py-2 w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Summary Section */}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-text mb-4 sm:mb-6">
                Summary
              </h2>
              <Card className="p-4 sm:p-6 bg-primary-100 h-fit">
                <CardContent>
                  <div className="max-w-none">
                    <Markdown rehypePlugins={[rehypeHighlight]}>
                      {summary?.summary}
                    </Markdown>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flashcards Section */}
            <div className="flex-1 select-none">
              <h2 className="text-2xl sm:text-3xl font-black text-text mb-4 sm:mb-6">
                Flashcards
              </h2>

              {flashcards.length > 0 && (
                <>
                  <Carousel
                    className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto"
                    setApi={setEmblaApi}
                  >
                    <CarouselContent>
                      {flashcards.map((_, index) => {
                        return (
                          <CarouselItem
                            key={index}
                            className={`select-none ${
                              flipped ? "animate-flip-horizontal-bottom" : ""
                            }`}
                          >
                            <Card
                              className={`p-4 sm:p-6 lg:p-8 mb-6 cursor-pointer transition-all duration-300 bg-primary-100`}
                              onClick={() => toggleCardFlip(index)}
                              style={{
                                minHeight: "200px",
                              }}
                            >
                              <div className="text-center min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
                                <div className="text-lg sm:text-xl font-bold text-text">
                                  <Markdown rehypePlugins={[rehypeHighlight]}>
                                    {cardFlipStates[index]
                                      ? flashcards[index]?.back
                                      : flashcards[index]?.front}
                                  </Markdown>
                                </div>
                              </div>

                              <div className="text-center mt-3 sm:mt-4">
                                <span className="text-xs sm:text-sm font-bold text-neutral-600">
                                  Click to{" "}
                                  {cardFlipStates[index]
                                    ? "see question"
                                    : "reveal answer"}
                                </span>
                              </div>
                            </Card>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <div className="hidden sm:flex">
                      <CarouselPrevious />
                      <CarouselNext />
                    </div>
                  </Carousel>
                </>
              )}
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="text-center mt-8 sm:mt-12">
            <Card className="p-4 sm:p-8 bg-primary-100">
              <h3 className="text-xl sm:text-2xl font-black text-text mb-3 sm:mb-4">
                Ready to test your knowledge?
              </h3>
              <p className="text-base sm:text-lg text-text font-bold mb-4 sm:mb-6">
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
              <div className="mb-4 sm:mb-6">
                <label className="block text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3">
                  Number of Questions
                </label>
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-bold border-4 border-border rounded-lg transition-all duration-300 ${
                        questionCount === count
                          ? "bg-primary-500 text-text scale-105"
                          : "bg-primary-200 text-text hover:bg-primary-100"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={startQuiz}
                disabled={startQuizLoading}
                className="bg-primary-400 text-neutral-50 font-bold text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                {startQuizLoading ? (
                  <span>
                    <LoadingSpinnerOnly message={"Starting"} />
                  </span>
                ) : (
                  <span className="flex flex-row items-center justify-center">
                    <Target className="mr-2" />
                    Start Quiz with {questionCount} Questions
                  </span>
                )}
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
      <div className="min-h-screen bg-background p-4 sm:p-6 relative">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text">
              Quiz: {topic}
            </h1>
            <Button
              onClick={() => setCurrentStep("study")}
              className="bg-primary-400 text-text font-bold px-3 sm:px-4 py-2 w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2" />
              Back to Study
            </Button>
          </div>

          <div className="text-center mb-4 sm:mb-6">
            <span className="text-base sm:text-lg font-bold text-text">
              Question {currentQuestionIndex + 1} of {quiz?.questions.length}
            </span>
          </div>

          <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-primary-100">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text mb-4 sm:mb-6">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3 sm:space-y-4">
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
                    className={`w-full p-3 sm:p-4 text-left border-2 sm:border-4 border-border rounded-lg font-bold transition-all duration-300 ${
                      isSelected
                        ? "bg-primary-500 text-black"
                        : "bg-secondary-background"
                    }`}
                  >
                    <span className="text-sm sm:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="bg-neutral-300 text-neutral-950 font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>

            <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="bg-primary-500 text-neutral-50 font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
                >
                  Next Question
                  <ArrowRight className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={finishQuiz}
                  disabled={
                    !selectedAnswers[currentQuestionIndex] || finishQuizLoading
                  }
                  className="bg-neutral-950 text-neutral-50 font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
                >
                  {finishQuizLoading ? (
                    <span>
                      <LoadingSpinnerOnly message={"Finishing Quiz"} />
                    </span>
                  ) : (
                    <span className="flex flex-row items-center justify-center">
                      Finish Quiz
                      <CheckCircle className="ml-2" />
                    </span>
                  )}
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

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 sm:mb-12">
            <div className="flex justify-center">
              <Star4
                size={70}
                color={"oklch(0.6632 0.1926 289.64)"}
                stroke={"black"}
                strokeWidth={6}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text mb-3 sm:mb-4">
              Congratulations!
            </h1>
            <p className="text-lg sm:text-xl text-text font-bold px-4">
              You've completed your study session on "{topic}"
            </p>
          </div>

          <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-primary-200">
            <h2 className="text-2xl sm:text-3xl font-black text-text mb-4 sm:mb-6">
              Your Results
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 bg-secondary-background">
                <div className="text-3xl sm:text-4xl font-black text-primary-500 mb-2">
                  {correctAnswers}
                </div>
                <div className="font-bold text-text text-sm sm:text-base">
                  Correct Answers
                </div>
              </Card>
              <Card className="p-4 sm:p-6 bg-secondary-background">
                <div className="text-3xl sm:text-4xl font-black text-primary-500 mb-2">
                  {quizScore}%
                </div>
                <div className="font-bold text-text text-sm sm:text-base">
                  Quiz Score
                </div>
              </Card>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button
              onClick={resetStudy}
              className="bg-primary-400 text-text font-bold px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
            >
              <RotateCcw className="mr-2" />
              Study Another Topic
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-secondary-background text-text font-bold px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
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
