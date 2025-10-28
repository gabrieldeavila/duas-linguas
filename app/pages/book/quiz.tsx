import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuizProps } from "~/types/table.types";
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
    if (!question) return;

    setQuestionsAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  };

  const handleSubmitQuiz = useCallback(() => {
    console.log("QuizContent rendered", quizQuestions);
    const isAllAnswered = quizQuestions.every(
      (q) => questionsAnswers[q.id] !== undefined
    );

    if (!isAllAnswered) {
      toast.error(t("answer_all_questions"));
      return;
    }
  }, [questionsAnswers, quizQuestions, t]);

  return (
    <div>
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
                    className="flex items-center space-x-4"
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
