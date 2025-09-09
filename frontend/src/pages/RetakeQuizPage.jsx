import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { userAPI } from "@/services/api";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

const RetakeQuizPage = () => {
  const navigate = useNavigate();
  const { userId, topicId } = useParams();

  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);

  const [topicName, setTopicName] = useState(null);

  const [quiz, setQuiz] = useState(null);

  //   const currentQuestion = quiz[0]?.questions[currentQuestionIndex];

  useEffect(() => {
    const getQuizData = async () => {
      const topicData = await userAPI.getTopicSessions(userId, topicId);
      const quizData = topicData.data[0].quizData;
      const topicName = topicData.data[0].topic;
      setQuiz(JSON.parse(quizData));
      setTopicName(topicName);
    };
    if (userId && topicId) {
      getQuizData();
    }
  }, [userId, topicId]);

  useEffect(() => {
    console.log("this:", quiz);
  }, [quiz]);
  if (!quiz && !topicName) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  const finishQuiz = async () => {
    console.log(selectedAnswers);

    // Calculate quiz results
    const correctAnswers = Object.entries(selectedAnswers).filter(
      ([questionIndex, answer]) =>
        quiz[parseInt(questionIndex)]?.correctAnswer === answer
    ).length;

    console.log(correctAnswers);

    const score = Math.round((correctAnswers / quiz.length) * 100);
    setQuizScore(score);

    // Collect quiz session data
    const quizCompletionData = {
      selectedAnswers,
      correctAnswers,
    };

    // Now update the quiz data
    await userAPI.updateTopicQuizData(userId, topicId, quizCompletionData);
  };

  return (
    // <div className="flex flex-col gap-4 px-24 py-5">
    //   <h1 className="text-4xl">Retaking quiz for: {topicName}</h1>
    //   <Card className={"text-lg"}>
    //     <CardHeader>
    //       <CardTitle>Question</CardTitle>
    //     </CardHeader>
    //     <CardContent className={"flex flex-col gap-4 "}>
    //       <h2>{quiz[0].question}</h2>
    //       <div className="flex flex-col gap-3">
    //         {quiz[0].options.map((option, index) => {
    //           return (
    //             <div
    //               key={index}
    //               className="bg-neutral-100 border-2 rounded-lg px-2 py-4"
    //             >
    //               {option}
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>

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
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl underline font-black text-neutral-950">
            Quiz: {topicName}
          </h1>
          <Button
            onClick={() => navigate(`/topic/${topicId}`)}
            className="bg-neutral-300 text-neutral-950 font-bold px-3 sm:px-4 py-2 w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2" />
            Back to Study
          </Button>
        </div>

        <div className="text-center mb-4 sm:mb-6">
          <span className="text-base sm:text-lg font-bold text-neutral-600">
            Question {currentQuestionIndex + 1} of {quiz.length}
          </span>
        </div>

        <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-primary-100">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-950 mb-4 sm:mb-6">
            {quiz[currentQuestionIndex].question}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {quiz[currentQuestionIndex].options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected =
                selectedAnswers[currentQuestionIndex] === optionLetter;

              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAnswers({
                      ...selectedAnswers,
                      [currentQuestionIndex]: optionLetter,
                    });
                  }}
                  className={`w-full p-3 sm:p-4 text-left border-2 sm:border-4 border-neutral-950 rounded-lg font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-primary-500 text-neutral-50"
                      : "bg-neutral-100"
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
              setCurrentQuestionIndex(currentQuestionIndex - 1);
            }}
            disabled={currentQuestionIndex === 0}
            className="bg-neutral-300 text-neutral-950 font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="mr-2" />
            Previous
          </Button>

          <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
            {currentQuestionIndex < quiz.length - 1 ? (
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className="bg-primary-500 text-neutral-50 font-bold px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                Next Question
                <ArrowRight className="ml-2" />
              </Button>
            ) : (
              <Button
                disabled={!selectedAnswers[currentQuestionIndex]}
                onClick={finishQuiz}
                className="bg-neutral-950 text-neutral-50 font-bold px-4 sm:px-6 py-2 sm:py-3 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
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
};

export default RetakeQuizPage;
