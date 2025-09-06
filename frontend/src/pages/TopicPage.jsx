import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Markdown from "react-markdown";

const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState(null);
  const [currentView, setCurrentView] = useState("summary"); // summary, flashcards, quiz
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipStates, setCardFlipStates] = useState({});
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [savedQuizResults, setSavedQuizResults] = useState(null);

  useEffect(() => {
    fetchTopicData();
  }, [topicId, userId]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching data for topic: ${topicId}`);

      // Convert topic ID back to topic name (reverse the slug conversion and URL encoding)
      const decodedTopicId = decodeURIComponent(topicId);
      const topicName = decodedTopicId.replace(/-/g, " ");

      const response = await userAPI.getTopicSessions(userId, topicName);
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
    setCardFlipStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-xl font-bold text-neutral-950">
            Loading topic data...
          </p>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-neutral-950 mb-2">
            Topic Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            No study data found for this topic.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-neutral-950 text-neutral-50"
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
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="mb-4 border-2 border-neutral-950"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-black text-neutral-950 mb-2">
            {topicName}
          </h1>
          <p className="text-neutral-600 font-bold">
            Review your study materials and test your knowledge
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setCurrentView("summary")}
            className={`font-bold px-6 py-3 ${
              currentView === "summary"
                ? "bg-neutral-950 text-neutral-50"
                : "bg-neutral-200 text-neutral-950 hover:bg-neutral-300"
            }`}
          >
            <BookOpen className="mr-2 w-4 h-4" />
            Summary
          </Button>

          <Button
            onClick={() => setCurrentView("flashcards")}
            className={`font-bold px-6 py-3 ${
              currentView === "flashcards"
                ? "bg-neutral-950 text-neutral-50"
                : "bg-neutral-200 text-neutral-950 hover:bg-neutral-300"
            }`}
          >
            <Brain className="mr-2 w-4 h-4" />
            Flashcards
          </Button>

          <Button
            onClick={() => {
              setCurrentView("quiz");
            }}
            className={`font-bold px-6 py-3 ${
              currentView === "quiz"
                ? "bg-neutral-950 text-neutral-50"
                : "bg-neutral-200 text-neutral-950 hover:bg-neutral-300"
            }`}
          >
            <Target className="mr-2 w-4 h-4" />
            Quiz
          </Button>
        </div>

        {/* Content Area */}
        {currentView === "summary" && (
          <Card className="p-8">
            <h2 className="text-2xl font-black text-neutral-950 mb-6">
              Study Summary
            </h2>
            <div className="prose prose-lg max-w-none">
              <Markdown>{topicData.generatedSummary}</Markdown>
            </div>
          </Card>
        )}

        {currentView === "flashcards" && topicData.flashCards && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-neutral-950">
                Flashcards ({currentCardIndex + 1} of{" "}
                {JSON.parse(topicData.flashCards).length})
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                  }
                  disabled={currentCardIndex === 0}
                  className="bg-neutral-200 text-neutral-950 hover:bg-neutral-300"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentCardIndex(
                      Math.min(
                        topicData.flashCards.length - 1,
                        currentCardIndex + 1
                      )
                    )
                  }
                  disabled={
                    currentCardIndex ===
                    JSON.parse(topicData.flashCards).length - 1
                  }
                  className="bg-neutral-200 text-neutral-950 hover:bg-neutral-300"
                >
                  Next
                </Button>
              </div>
            </div>

            <Card
              className="h-96 cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => toggleCardFlip(currentCardIndex)}
            >
              <CardContent className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  {!cardFlipStates[currentCardIndex] ? (
                    <>
                      <h3 className="text-xl font-bold text-neutral-950 mb-4">
                        Question
                      </h3>
                      <p className="text-lg text-neutral-700">
                        {
                          JSON.parse(topicData.flashCards)[currentCardIndex]
                            ?.front
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-neutral-950 mb-4">
                        Answer
                      </h3>
                      <div className="text-lg text-neutral-700">
                        <Markdown>
                          {
                            JSON.parse(topicData.flashCards)[currentCardIndex]
                              ?.back
                          }
                        </Markdown>
                      </div>
                    </>
                  )}
                  <p className="text-sm text-neutral-500 mt-6">Click to flip</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "quiz" && topicData.quizData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-neutral-950">
                Quiz Results
              </h2>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-primary-100">
                  <div className="text-3xl font-black text-primary-600 mb-2">
                    {calculateQuizResults().score}%
                  </div>
                  <div className="font-bold text-neutral-950">Score</div>
                </Card>

                <Card className="p-6 bg-neutral-100">
                  <div className="text-3xl font-black text-neutral-950 mb-2">
                    {calculateQuizResults().correctAnswers}/
                    {calculateQuizResults().totalQuestions ||
                      JSON.parse(topicData.quizData).length}
                  </div>
                  <div className="font-bold text-neutral-950">
                    Correct Answers
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-neutral-50">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-950 mb-2">
                    Quiz Completed During Topic Creation
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    This quiz was completed when you first created this topic.
                    Your performance is shown above.
                  </p>
                  <Button
                    onClick={() => navigate("/study")}
                    className="bg-primary-500 text-white font-bold"
                  >
                    <RotateCcw className="mr-2 w-4 h-4" />
                    Retake Quiz
                  </Button>
                </div>
              </Card>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPage;
