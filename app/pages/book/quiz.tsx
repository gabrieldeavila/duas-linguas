import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuizProps, QuizReturnProps } from "~/types/table.types";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Square, SquareCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function Quiz({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation("quiz");

  return (
    <div className={cn("flex my-8 justify-center")}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>{t("start_quiz")}</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl">
          <QuizContent
            {...{
              bookId,
              chapterId,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Quiz;

const QuizContent = ({
  bookId,
  chapterId,
}: {
  bookId: string;
  chapterId: string;
}) => {
  const [quizQuestions, setQuizQuestions] = useState<QuizProps[]>([]);
  const [quizSubmitResult, setQuizSubmitResult] = useState<
    QuizReturnProps[0] | null
  >({
    correct_answers: 8,
    total_questions: 8,
    score_percentage: 100,
    passed: true,
    explanation: [
      {
        id: "d65e9991-ac72-46c2-8c27-59e2ebcb59ec",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "7c0caa1a-9c29-4224-91b1-95510b96618e",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "755db85f-54db-4e9f-8d42-f15ec4d0a45d",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "11a901f3-dc62-4010-bac8-9ce343caf5bc",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "af16b8dc-11a6-4e08-9f5a-c0e66ebe7787",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "20677dff-0e64-4a49-a004-a5894056a15e",
        is_correct: true,
        explanation: null,
        user_answer: "A",
        correct_answer: "A",
      },
      {
        id: "01546164-470d-4d38-a143-08bbc04fa7ff",
        is_correct: true,
        explanation: null,
        user_answer: "B",
        correct_answer: "B",
      },
      {
        id: "28f90d13-9ad7-4e0e-b8f3-f80defddf18d",
        is_correct: true,
        explanation: null,
        user_answer: "C",
        correct_answer: "C",
      },
    ],
    xp_earned: 25,
    total_xp: 40,
    new_level: 1,
    current_streak: 1,
    longest_streak: 1,
    attempt_number: 1,
  });

  const isLoadingRef = useRef(false);
  const supabase = useSupabase();
  const { t } = useTranslation("quiz");
  const { t: tg } = useTranslation("general");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswers, setQuestionsAnswers] = useState<
    Record<string, string>
  >({});

  const question = useMemo(
    () => quizQuestions[currentQuestionIndex],
    [quizQuestions, currentQuestionIndex]
  );
  const currentQuestionAnswer = useMemo(
    () => questionsAnswers[question?.id || ""],
    [questionsAnswers, question?.id]
  );

  const didSubmit = useMemo(() => {
    return quizSubmitResult !== null;
  }, [quizSubmitResult]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    supabase
      .rpc("get_quiz_questions", {
        p_book_id: bookId,
        p_chapter_id: chapterId,
      })
      .then(({ data, error }) => {
        isLoadingRef.current = false;
        if (error) {
          console.error("Error fetching quiz questions:", error);
          return;
        }

        setQuizQuestions(data || []);
      });
  }, [bookId, chapterId, supabase]);

  const handleAnswerSelect = (optionIndex: string) => {
    // if (!question || didSubmit) return;

    setQuestionsAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  };

  const numberToLetter = (num: number) => {
    return String.fromCharCode(65 + num); // 0 -> A, 1 -> B, 2 -> C, etc.
  };

  const handleSubmitQuiz = useCallback(() => {
    const isAllAnswered = quizQuestions.every(
      (q) => questionsAnswers[q.id] !== undefined
    );

    if (!isAllAnswered) {
      toast.error(t("answer_all_questions"));
      // return;
    }

    supabase
      .rpc("submit_quiz_answers", {
        p_book_id: bookId,
        p_chapter_id: chapterId,
        p_answers: Object.entries(questionsAnswers).map(
          ([questionId, answer]) => ({
            id: questionId,
            answer: numberToLetter(parseInt(answer, 10)),
          })
        ),
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error submitting quiz answers:", error);
          toast.error(t("submit_error"));
          return;
        }

        console.log(data);
        setQuizSubmitResult(data[0] || null);
      });
  }, [bookId, chapterId, questionsAnswers, quizQuestions, supabase, t]);

  const isCurrentQuestionCorrect = useMemo(() => {
    if (!quizSubmitResult || !question || !quizSubmitResult.explanation) {
      return null;
    }

    const answerRecord = (quizSubmitResult.explanation as any).find(
      (ex) => ex.id === question.id
    );

    return !!answerRecord?.is_correct;
  }, [quizSubmitResult, question]);

  return (
    <div>
      {quizSubmitResult && <SubmitAnswersResult result={quizSubmitResult} />}

      {question && (
        <div key={question.id} className="my-4">
          <p className="font-bold">
            {t("question_of", {
              current: currentQuestionIndex + 1,
              total: quizQuestions.length,
            })}
          </p>
          <p className="mt-2">{question.question}</p>
          <ul className="mt-2 space-y-2">
            {Array.isArray(question.options) &&
              question.options?.map((option, index) => (
                <li key={index}>
                  <button
                    className={cn("flex items-center space-x-4")}
                    style={
                      isCurrentQuestionCorrect &&
                      currentQuestionAnswer === index.toString()
                        ? {
                            backgroundColor: "var(--green-100)",
                          }
                        : undefined
                    }
                    onClick={() => handleAnswerSelect(index.toString())}
                  >
                    {currentQuestionAnswer === index.toString() ? (
                      <SquareCheck />
                    ) : (
                      <Square />
                    )}
                    <p>{option?.toString()}</p>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
        >
          {tg("previous")}
        </Button>
        {currentQuestionIndex === quizQuestions.length - 1 && (
          <Button onClick={handleSubmitQuiz}>{t("submit_quiz")}</Button>
        )}

        <Button
          variant="outline"
          disabled={currentQuestionIndex === quizQuestions.length - 1}
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, quizQuestions.length - 1)
            )
          }
        >
          {tg("next")}
        </Button>
      </div>
    </div>
  );
};

const SubmitAnswersResult = ({ result }: { result: QuizReturnProps[0] }) => {
  const { t } = useTranslation("quiz");

  return (
    <div className="my-4 p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">{t("quiz_results")}</h2>
      <p>
        {t("score")}: {result.correct_answers} / {result.total_questions} (
        {result.score_percentage}%)
      </p>
      <p>
        {t("xp_earned")}: {result.xp_earned}
      </p>
      <p>
        {t("current_streak")}: {result.current_streak}
      </p>
    </div>
  );
};
