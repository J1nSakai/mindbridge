import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";

const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipStates, setCardFlipStates] = useState({});
  const [flipped, setFlipped] = useState(false);

  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [savedQuizResults, setSavedQuizResults] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const [emblaApi, setEmblaApi] = useState(null);

  useEffect(() => {
    fetchTopicData();
  }, [topicId, userId]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const currIndex = emblaApi.selectedScrollSnap();
      setCurrentCardIndex(currIndex); // Sync with carousel position

      // Optional: detect swipe direction
      console.log("Current slide:", currIndex);
    };

    // Add the event listener
    emblaApi.on("select", onSelect);

    // Set initial index
    setCurrentCardIndex(emblaApi.selectedScrollSnap());

    // Cleanup function
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Reset card flip states and index when switching to flashcards tab
  useEffect(() => {
    if (activeTab === "flashcards") {
      setCardFlipStates({});
      setCurrentCardIndex(0);
    }
  }, [activeTab]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching data for topic: ${topicId}`);

      // Convert topic ID back to topic name (reverse the slug conversion and URL encoding)

      const response = await userAPI.getTopicSessions(userId, topicId);
      console.log("📊 Topic data received:", response);

      // Handle the API response format { success: true, data: sessions.rows }
      const sessions = response.data || response;

      if (sessions && sessions.length > 0) {
        // Get the most recent complete session with all data
        const completeSession = sessions.find(
          (session) =>
            session.type === "complete" &&
            session.generatedSummary &&
            session.flashCards &&
            session.quizData
        );

        if (completeSession) {
          setTopicData(completeSession);

          // Check if user has already completed the quiz
          if (
            completeSession.correctAnswers !== null &&
            completeSession.questionsAnswered !== null
          ) {
            setHasCompletedQuiz(true);

            // Calculate and save the quiz results from the session data
            const score = Math.round(
              (completeSession.correctAnswers /
                completeSession.questionsAnswered) *
                100
            );
            setSavedQuizResults({
              score,
              correctAnswers: completeSession.correctAnswers,
              totalQuestions: completeSession.questionsAnswered,
            });
          }
        } else {
          console.warn("No complete session found with all data");
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch topic data:", error);
    } finally {
      setLoading(false);
    }
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

  const calculateQuizResults = () => {
    // Use saved results from the initial quiz attempt
    if (hasCompletedQuiz && savedQuizResults) {
      return savedQuizResults;
    }

    // Fallback if no saved results available
    if (!topicData?.quizData)
      return { score: 0, correctAnswers: 0, totalQuestions: 0 };

    const quizQuestions = JSON.parse(topicData.quizData);
    return {
      score: 0,
      correctAnswers: 0,
      totalQuestions: quizQuestions.length,
    };
  };

  if (loading) {
    return <LoadingSpinner message="Loading topic data..." />;
  }

  if (!topicData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-text mb-2">Topic Not Found</h1>
          <p className="text-text mb-6">No study data found for this topic.</p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary-400 text-text"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const topicName = topicData.topic;

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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
            <div className="flex-1 order-2 sm:order-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text mb-2 px-2 sm:px-0">
                {topicName}
              </h1>
              <p className="text-text font-bold text-sm sm:text-base px-2 sm:px-0">
                Review your study materials and test your knowledge
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-primary-400 text-text order-1 sm:order-2 px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto sm:flex-shrink-0"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0 align-middle"> */}
        <Tabs
          defaultValue="summary"
          onValueChange={setActiveTab}
          className={""}
        >
          <TabsList className="">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <h2 className="text-xl sm:text-2xl font-black text-text mb-4 sm:mb-6">
              Topic Summary
            </h2>
            <Card className="p-4 sm:p-6 lg:p-8 mx-2 sm:mx-0 bg-secondary-background">
              <div className="max-w-none">
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {topicData.generatedSummary}
                </Markdown>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="flashcards">
            <div className="space-y-4 sm:space-y-6 mx-2 sm:mx-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-black text-text">
                  Flashcards ({currentCardIndex + 1} of{" "}
                  {JSON.parse(topicData.flashCards).length})
                </h2>
              </div>
              <Carousel
                setApi={setEmblaApi}
                className={"w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto"}
              >
                <CarouselContent>
                  {Array.from({
                    length: JSON.parse(topicData.flashCards).length,
                  }).map((_, index) => {
                    return (
                      <CarouselItem
                        key={index}
                        className={`select-none ${
                          flipped ? "animate-flip-horizontal-bottom" : ""
                        }`}
                      >
                        <Card
                          className={`h-80 sm:h-96 cursor-pointer bg-secondary-background`}
                          onClick={() => toggleCardFlip(currentCardIndex)}
                        >
                          <CardContent className="h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                            <div className="text-center">
                              {!cardFlipStates[currentCardIndex] ? (
                                <>
                                  <h3 className="text-lg sm:text-xl text-text mb-3 sm:mb-4 underline">
                                    Question
                                  </h3>
                                  <p className="text-base sm:text-lg font-bold text-text">
                                    <Markdown rehypePlugins={[rehypeHighlight]}>
                                      {
                                        JSON.parse(topicData.flashCards)[
                                          currentCardIndex
                                        ]?.front
                                      }
                                    </Markdown>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-lg sm:text-xl text-text underline mb-3 sm:mb-4">
                                    Answer
                                  </h3>
                                  <div className="text-base sm:text-lg font-bold text-text">
                                    <Markdown rehypePlugins={[rehypeHighlight]}>
                                      {
                                        JSON.parse(topicData.flashCards)[
                                          currentCardIndex
                                        ]?.back
                                      }
                                    </Markdown>
                                  </div>
                                </>
                              )}
                              <p className="text-xs sm:text-sm text-neutral-500 mt-4 sm:mt-6">
                                Click to flip
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter
                            className={
                              "flex sm:hidden justify-between text-xs sm:text-sm text-neutral-500 mt-4 sm:mt-6"
                            }
                          >
                            <div
                              className={` items-center justify-center ${
                                currentCardIndex === 0 ? "hidden" : "flex"
                              }`}
                            >
                              Swipe Right
                              <ArrowRight className="ml-2 sm:ml-4 h-4 sm:h-6 w-4 sm:w-6" />
                            </div>
                            <div
                              className={` items-center justify-center ${
                                currentCardIndex ===
                                JSON.parse(topicData.flashCards).length - 1
                                  ? "hidden"
                                  : "flex"
                              }`}
                            >
                              <ArrowLeft className="mr-2 sm:mr-4 h-4 sm:h-6 w-4 sm:w-6" />
                              Swipe Left
                            </div>
                          </CardFooter>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <button
                  onClick={() =>
                    setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                  }
                  disabled={currentCardIndex === 0}
                  className={`${
                    currentCardIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } hidden sm:flex`}
                >
                  <CarouselPrevious size="sm" />
                </button>
                <button
                  onClick={() =>
                    setCurrentCardIndex(
                      Math.min(
                        JSON.parse(topicData.flashCards).length - 1,
                        currentCardIndex + 1
                      )
                    )
                  }
                  disabled={
                    currentCardIndex ===
                    JSON.parse(topicData.flashCards).length - 1
                  }
                  className={`${
                    currentCardIndex ===
                    JSON.parse(topicData.flashCards).length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } hidden sm:flex`}
                >
                  <CarouselNext />
                </button>
              </Carousel>
            </div>
          </TabsContent>
          <TabsContent value="quiz">
            <div className="space-y-4 sm:space-y-6 mx-2 sm:mx-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-black text-text">
                  Quiz Results
                </h2>
              </div>

              <Card className="p-4 sm:p-6 lg:p-8 bg-secondary-background">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-black text-primary-600 mb-2">
                      {calculateQuizResults().score}%
                    </div>
                    <div className="font-bold text-text text-sm sm:text-base">
                      Score
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-black text-textmb-2">
                      {calculateQuizResults().correctAnswers}/
                      {calculateQuizResults().totalQuestions ||
                        JSON.parse(topicData.quizData).length}
                    </div>
                    <div className="font-bold text-text text-sm sm:text-base">
                      Correct Answers
                    </div>
                  </Card>
                </div>

                <Card className="p-4 sm:p-6">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-text mb-2">
                      Quiz Completed During Topic Creation
                    </h3>
                    <p className="text-text mb-4 text-sm sm:text-base">
                      This quiz was completed when you first created this topic.
                      Your performance is shown above.
                    </p>
                    <Button
                      onClick={() =>
                        navigate(`/retake-quiz/${userId}/topic/${topicId}`)
                      }
                      className="bg-primary-400 text-text font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-sm sm:text-base"
                    >
                      <RotateCcw className="mr-2 w-4 h-4" />
                      Retake Quiz
                    </Button>
                  </div>
                </Card>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    // </div>
  );
};

export default TopicPage;
