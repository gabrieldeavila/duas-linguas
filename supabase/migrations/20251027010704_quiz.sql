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
  ORDER BY random();
END;
$$;

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  correct_answers int NOT NULL,
  total_questions int NOT NULL,
  score_percentage float NOT NULL,
  passed boolean NOT NULL,
  attempt_number int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to quiz results for the owner" ON quiz_results
  FOR SELECT
  TO public
  USING (user_id = auth.uid());


CREATE TABLE IF NOT EXISTS user_levels (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_levels
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see their own levels" ON user_levels
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS user_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  contribution_type text NOT NULL, -- e.g. 'quiz_completed', 'quiz_passed'
  xp_earned int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_contributions
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see their own contributions" ON user_contributions
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION submit_quiz_answers(
  p_book_id uuid,
  p_chapter_id uuid,
  p_answers jsonb
)
RETURNS TABLE(
  correct_answers int,
  total_questions int,
  score_percentage float,
  passed boolean,
  explanation jsonb,
  xp_earned int,
  total_xp int,
  new_level int,
  current_streak int,
  longest_streak int,
  attempt_number int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total int := 0;
  p_user_id uuid := auth.uid();
  v_correct int := 0;
  v_explanations jsonb := '[]'::jsonb;
  v_question record;
  v_answer text;
  v_passed boolean;
  v_score float;
  v_xp_gain int := 0;
  v_bonus_xp int := 0;
  v_total_xp int := 0;
  v_level int := 1;
  v_current_streak int := 0;
  v_longest_streak int := 0;
  v_last_activity timestamptz;
  v_today timestamptz := date_trunc('day', now());
  v_attempt_number int := 1;
  v_first_time boolean := true;
BEGIN
  -- Count previous attempts for this quiz
  SELECT COUNT(*) + 1
  INTO v_attempt_number
  FROM quiz_results
  WHERE user_id = p_user_id
    AND book_id = p_book_id
    AND chapter_id = p_chapter_id;

  -- If there are previous attempts, mark as repeat
  IF v_attempt_number > 1 THEN
    v_first_time := false;
  END IF;

  -- Compute quiz results
  FOR v_question IN
    SELECT q.id, q.answer, q.explanation
    FROM questions q
    WHERE q.book_id = p_book_id
      AND q.chapter_id = p_chapter_id
  LOOP
    v_total := v_total + 1;

    v_answer := (
      SELECT a->>'answer'
      FROM jsonb_array_elements(p_answers) AS a
      WHERE (a->>'id')::uuid = v_question.id
      LIMIT 1
    );

    IF v_answer IS NOT NULL AND trim(lower(v_answer)) = trim(lower(v_question.answer)) THEN
      v_correct := v_correct + 1;
    END IF;

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

  v_score := CASE WHEN v_total > 0 THEN (v_correct::float / v_total::float) * 100 ELSE 0 END;
  v_passed := v_score >= 60.0;

  -- XP rules
  IF v_first_time THEN
    v_xp_gain := CASE WHEN v_passed THEN 20 ELSE 10 END;
  ELSE
    v_xp_gain := 0;
  END IF;

  -- Insert quiz result (always logged)
  INSERT INTO quiz_results (
    user_id, book_id, chapter_id, correct_answers, total_questions,
    score_percentage, passed, attempt_number
  )
  VALUES (
    p_user_id, p_book_id, p_chapter_id, v_correct, v_total,
    v_score, v_passed, v_attempt_number
  );

  -- Only log contributions + streak if first time
  IF v_first_time THEN
    INSERT INTO user_contributions (
      user_id, book_id, chapter_id, contribution_type, xp_earned
    )
    VALUES (
      p_user_id, p_book_id, p_chapter_id,
      CASE WHEN v_passed THEN 'quiz_passed' ELSE 'quiz_completed' END,
      v_xp_gain
    );

    -- Fetch level info
    SELECT xp, level, current_streak, longest_streak, last_activity_date
    INTO v_total_xp, v_level, v_current_streak, v_longest_streak, v_last_activity
    FROM user_levels
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_total_xp := 0;
      v_level := 1;
      v_current_streak := 0;
      v_longest_streak := 0;
    END IF;

    -- Streak logic
    IF v_last_activity IS NULL OR v_last_activity < v_today - 1 THEN
      v_current_streak := 1;
    ELSIF v_last_activity = v_today - 1 THEN
      v_current_streak := v_current_streak + 1;
    END IF;

    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;

    -- Bonus XP for today's first contribution
    IF v_last_activity IS DISTINCT FROM v_today THEN
      v_bonus_xp := 5;
    END IF;

    v_total_xp := v_total_xp + v_xp_gain + v_bonus_xp;

    -- Level recalculation
    LOOP
      EXIT WHEN v_total_xp < (50 * (v_level + 1) * v_level);
      v_level := v_level + 1;
    END LOOP;

    -- Upsert level data
    INSERT INTO user_levels (user_id, xp, level, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, v_total_xp, v_level, v_current_streak, v_longest_streak, v_today)
    ON CONFLICT (user_id)
    DO UPDATE SET
      user_levels.xp = EXCLUDED.xp,
      user_levels.level = EXCLUDED.level,
      user_levels.current_streak = EXCLUDED.current_streak,
      user_levels.longest_streak = EXCLUDED.longest_streak,
      user_levels.last_activity_date = EXCLUDED.last_activity_date,
      user_levels.updated_at = now();
  ELSE
    -- If not first attempt, fetch current stats
    SELECT xp, level, current_streak, longest_streak
    INTO v_total_xp, v_level, v_current_streak, v_longest_streak
    FROM user_levels
    WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY
  SELECT v_correct, v_total, v_score, v_passed, v_explanations,
         (v_xp_gain + v_bonus_xp), v_total_xp, v_level,
         v_current_streak, v_longest_streak, v_attempt_number;
END;
$$;
