import { Square, SquareCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, numberToLetter } from "~/lib/utils";
import type { QuizProps, QuizReturnProps } from "~/types/table.types";

function Quiz({
  bookId,
  chapterId,
  goToNextChapter,
}: {
  bookId: string;
  chapterId: string;
  goToNextChapter: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation("quiz");

  return (
    <div className={cn("flex my-8 justify-center flex-col items-center gap-2")}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>{t("start_quiz")}</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl">
          <QuizContent
            {...{
              bookId,
              chapterId,
              setIsOpen,
              goToNextChapter,
            }}
          />
        </DialogContent>
      </Dialog>
      <QuizTaken chapterId={chapterId} />
    </div>
  );
}

export default Quiz;

const QuizTaken = ({ chapterId }: { chapterId: string }) => {
  const [hasTakenQuiz, setHasTakenQuiz] = useState<{
    id: string;
    score_percentage: number;
    passed: boolean;
  } | null>(null);
  const isLoadingRef = useRef(false);
  const supabase = useSupabase();
  const { t } = useTranslation("quiz");

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    supabase
      .from("quiz_results")
      .select("id, score_percentage, passed")
      .eq("chapter_id", chapterId)
      .order("score_percentage", { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        isLoadingRef.current = false;

        if (error) {
          console.error("Error checking quiz taken:", error);
          return;
        }

        setHasTakenQuiz(data || null);
      });
  }, [chapterId, supabase]);

  if (hasTakenQuiz === null) {
    return <></>;
  }

  return (
    <span className="ml-2 text-xs opacity-50">
      {hasTakenQuiz.passed
        ? t("quiz_taken.passed", {
            percentage: hasTakenQuiz.score_percentage,
          })
        : t("quiz_taken.failed", {
            percentage: hasTakenQuiz.score_percentage,
          })}
    </span>
  );
};

type ExplanationProps = {
  id: string;
  is_correct: boolean;
  explanation: string | null;
  user_answer: string;
  correct_answer: string;
};

const QuizContent = ({
  bookId,
  chapterId,
  setIsOpen,
  goToNextChapter,
}: {
  bookId: string;
  chapterId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goToNextChapter: () => void;
}) => {
  const [quizQuestions, setQuizQuestions] = useState<QuizProps[]>([]);
  const [quizSubmitResult, setQuizSubmitResult] = useState<
    QuizReturnProps[0] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsLoading(false);

        if (error) {
          console.error("Error fetching quiz questions:", error);
          return;
        }

        setQuizQuestions(data || []);
      });
  }, [bookId, chapterId, supabase]);

  const handleAnswerSelect = (optionIndex: string) => {
    if (!question || didSubmit) return;

    setQuestionsAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  };

  const handleSubmitQuiz = useCallback(() => {
    const isAllAnswered = quizQuestions.every(
      (q) => questionsAnswers[q.id] !== undefined
    );

    if (didSubmit) {
      toast.error(t("quiz_already_submitted"));
      return;
    }

    if (!isAllAnswered) {
      toast.error(t("answer_all_questions"));
      return;
    }

    setIsSubmitting(true);
    supabase
      .rpc("submit_quiz_answers", {
        p_book_id: bookId,
        p_chapter_id: chapterId,
        p_user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        p_answers: Object.entries(questionsAnswers).map(
          ([questionId, answer]) => ({
            id: questionId,
            answer: numberToLetter(parseInt(answer, 10)),
          })
        ),
      })
      .then(({ data, error }) => {
        setIsSubmitting(false);
        if (error) {
          toast.error(t("submit_error"));
          return;
        }

        setQuizSubmitResult(data[0] || null);
      });
  }, [
    bookId,
    chapterId,
    didSubmit,
    questionsAnswers,
    quizQuestions,
    supabase,
    t,
  ]);

  const currentQuestionExplanation = useMemo(() => {
    if (!quizSubmitResult || !question || !quizSubmitResult.explanation) {
      return null;
    }

    const answerRecord = (
      quizSubmitResult.explanation as ExplanationProps[]
    ).find((ex) => ex.id === question.id);

    return answerRecord || null;
  }, [quizSubmitResult, question]);

  const handleClose = useCallback(() => {
    setIsOpen(false);

    if (quizSubmitResult?.passed) {
      goToNextChapter();
    }
  }, [goToNextChapter, quizSubmitResult?.passed, setIsOpen]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full mt-5" />;
  }

  return (
    <div className={cn("my-4", "max-h-[65dvh] overflow-auto")}>
      {quizSubmitResult && <SubmitAnswersResult result={quizSubmitResult} />}

      {question && (
        <div key={question.id}>
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
                <QuestionOption
                  key={index}
                  {...{
                    option: option as string,
                    currentQuestionAnswer,
                    currentQuestionExplanation,
                    handleAnswerSelect,
                    index,
                  }}
                />
              ))}
          </ul>
          {currentQuestionExplanation &&
            currentQuestionExplanation.explanation && (
              <div className="mt-4">
                <p className="font-bold">{t("explanation")}</p>
                <p className="mt-2">{currentQuestionExplanation.explanation}</p>
              </div>
            )}
        </div>
      )}
      <div className={cn("flex justify-between mt-4 flex-wrap gap-2")}>
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
        >
          {tg("previous")}
        </Button>

        {currentQuestionIndex === quizQuestions.length - 1 && !didSubmit && (
          <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
            {t("submit_quiz")}
          </Button>
        )}

        {didSubmit && <Button onClick={handleClose}>{tg("close")}</Button>}

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

const QuestionOption = ({
  option,
  currentQuestionAnswer,
  currentQuestionExplanation,
  handleAnswerSelect,
  index,
}: {
  option: string;
  currentQuestionAnswer: string | null;
  currentQuestionExplanation: ExplanationProps | null;
  index: number;
  handleAnswerSelect: (optionIndex: string) => void;
}) => {
  const backgroundColor = useMemo(() => {
    if (!currentQuestionExplanation) return undefined;

    if (currentQuestionExplanation.user_answer === numberToLetter(index)) {
      return currentQuestionExplanation.is_correct
        ? "bg-green-500 text-white"
        : "bg-red-500 text-white";
    }

    if (currentQuestionExplanation.correct_answer === numberToLetter(index)) {
      return "bg-green-500 text-white";
    }

    return undefined;
  }, [currentQuestionExplanation, index]);

  return (
    <li>
      <button
        className={cn(
          "flex items-center gap-5 p-1 rounded-md",
          backgroundColor
        )}
        onClick={() => handleAnswerSelect(index.toString())}
      >
        <div>
          {currentQuestionAnswer === index.toString() ? (
            <SquareCheck size={20} />
          ) : (
            <Square size={20} />
          )}
        </div>

        <p className="text-left flex-grow">{option?.toString()}</p>
      </button>
    </li>
  );
};

const SubmitAnswersResult = ({ result }: { result: QuizReturnProps[0] }) => {
  const { t } = useTranslation("quiz");

  return (
    <div className="my-4 p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">{t("quiz_results")}</h2>
      <p className="mb-2">{result.passed ? t("passed") : t("failed")}</p>
      {result.did_level_up && (
        <p className="mb-2">{t("level_up", { level: result.new_level })}</p>
      )}

      {result.attempt_number > 1 && (
        <p className="mb-2">
          {t("attempt_number", { count: result.attempt_number })}
        </p>
      )}

      <p>
        {t("score", {
          count: result.correct_answers,
          total: result.total_questions,
          percentage: result.score_percentage,
        })}
      </p>
      <p>
        {t("xp_earned", {
          xp: result.xp_earned,
        })}
      </p>

      {result.did_finish_book && (
        <p className="mt-2 font-bold">
          🎉 {t("congratulations_on_finishing_the_book")}
        </p>
      )}
    </div>
  );
};
