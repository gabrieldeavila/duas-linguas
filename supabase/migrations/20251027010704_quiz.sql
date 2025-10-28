DROP POLICY IF EXISTS "Allow read access to everyone" ON questions;

ALTER TABLE questions DROP COLUMN IF EXISTS why;

CREATE OR REPLACE FUNCTION get_quiz_questions(
  p_book_id uuid,
  p_chapter_id uuid
)
RETURNS TABLE (
  id uuid,
  question text,
  options jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.question,
    q.options
  FROM questions q
  WHERE q.book_id = p_book_id
    AND q.chapter_id = p_chapter_id
  ORDER BY random()
  LIMIT 5;
END;
$$;

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  correct_answers int NOT NULL,
  total_questions int NOT NULL,
  score_percentage float NOT NULL,
  passed boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION submit_quiz_answers(
  p_user_id uuid,
  p_book_id uuid,
  p_chapter_id uuid,
  p_answers jsonb
)
RETURNS TABLE(
  correct_answers int,
  total_questions int,
  score_percentage float,
  passed boolean,
  explanation jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total int := 0;
  v_correct int := 0;
  v_explanations jsonb := '[]'::jsonb;
  v_question record;
  v_answer text;
  v_passed boolean;
  v_score float;
BEGIN
  -- Loop through all questions in this chapter
  FOR v_question IN
    SELECT q.id, q.answer, q.explanation
    FROM questions q
    WHERE q.book_id = p_book_id
      AND q.chapter_id = p_chapter_id
  LOOP
    v_total := v_total + 1;

    -- Get the user’s answer for this question
    v_answer := (
      SELECT a->>'answer'
      FROM jsonb_array_elements(p_answers) AS a
      WHERE (a->>'id')::uuid = v_question.id
      LIMIT 1
    );

    -- Compare answers
    IF v_answer IS NOT NULL AND trim(lower(v_answer)) = trim(lower(v_question.answer)) THEN
      v_correct := v_correct + 1;
    END IF;

    -- Build explanations array
    v_explanations := v_explanations || jsonb_build_array(
      jsonb_build_object(
        'id', v_question.id,
        'correct_answer', v_question.answer,
        'user_answer', v_answer,
        'is_correct', trim(lower(v_answer)) = trim(lower(v_question.answer)),
        'explanation', v_question.explanation
      )
    );
  END LOOP;

  -- Calculate stats
  v_score := CASE WHEN v_total > 0 THEN (v_correct::float / v_total::float) * 100 ELSE 0 END;
  v_passed := v_score >= 60.0;

  -- Save result into quiz_results
  INSERT INTO quiz_results (
    user_id, book_id, chapter_id, correct_answers, total_questions,
    score_percentage, passed
  ) VALUES (
    p_user_id, p_book_id, p_chapter_id, v_correct, v_total,
    v_score, v_passed
  );

  -- Return result
  RETURN QUERY
  SELECT v_correct, v_total, v_score, v_passed, v_explanations;
END;
$$;

ALTER TABLE quiz_results
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to quiz results for the owner" ON quiz_results
  FOR SELECT
  TO public
  USING (user_id = auth.uid());