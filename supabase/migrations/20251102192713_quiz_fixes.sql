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
  attempt_number int,
  did_level_up boolean,
  did_finish_book boolean
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
  v_today timestamptz := now();
  v_attempt_number int := 1;
  v_first_time boolean := true;
  v_current_level int;
  v_did_level_up boolean := false;
  v_did_finish_book boolean := false;
  v_num_quiz_taken int := 0;
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

  -- Fetch current level
  SELECT level
  INTO v_current_level
  FROM user_levels
  WHERE user_id = p_user_id;

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
    SELECT ul.xp, ul.level, ul.current_streak, ul.longest_streak, ul.last_activity_date
    INTO v_total_xp, v_level, v_current_streak, v_longest_streak, v_last_activity
    FROM user_levels as ul
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_total_xp := 0;
      v_level := 1;
      v_current_streak := 0;
      v_longest_streak := 0;
    END IF;

    -- Streak logic
    IF v_last_activity IS NULL OR date_trunc('day', v_last_activity) < date_trunc('day', v_today - interval '1 day') THEN
      v_current_streak := 1;
    ELSIF date_trunc('day', v_last_activity) = date_trunc('day', v_today - interval '1 day') THEN
      v_current_streak := v_current_streak + 1;
    -- If last activity is today, streak remains unchanged
    END IF;

    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;

    -- Bonus XP for today's first contribution
    IF v_last_activity IS DISTINCT FROM v_today THEN
      v_bonus_xp := 5;
    END IF;

    IF v_passed THEN
      -- Update book_focus num_quiz_taken
      UPDATE book_focus
      SET num_quiz_taken = num_quiz_taken + 1
      WHERE user_id = p_user_id
        AND book_id = p_book_id;

      SELECT num_quiz_taken
      INTO v_num_quiz_taken
      FROM book_focus
      WHERE user_id = p_user_id
        AND book_id = p_book_id;

      -- Check if user finished all chapters in the book
      IF EXISTS (
        SELECT 1
        FROM books b
        WHERE v_num_quiz_taken >= chapter_end 
        AND b.id = p_book_id
      ) THEN
        v_did_finish_book := true;
      END IF;
    END IF;

    IF v_did_finish_book THEN
      v_bonus_xp := v_bonus_xp + 5 * v_num_quiz_taken;
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
      xp = EXCLUDED.xp,
      level = EXCLUDED.level,
      current_streak = EXCLUDED.current_streak,
      longest_streak = EXCLUDED.longest_streak,
      last_activity_date = EXCLUDED.last_activity_date,
      updated_at = now();
  ELSE
    -- If not first attempt, fetch current stats
    SELECT xp, level, current_streak, longest_streak
    INTO v_total_xp, v_level, v_current_streak, v_longest_streak
    FROM user_levels
    WHERE user_id = p_user_id;
  END IF;

  -- Check if leveled up
  IF v_level > v_current_level THEN
    v_did_level_up := true;
  END IF;

  RETURN QUERY
  SELECT v_correct, v_total, v_score, v_passed, v_explanations,
         (v_xp_gain + v_bonus_xp), v_total_xp, v_level,
         v_current_streak, v_longest_streak, v_attempt_number, v_did_level_up, v_did_finish_book;
END;
$$;

drop function if exists get_quiz_stats;

CREATE OR REPLACE FUNCTION get_quiz_stats(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_timezone text
)
RETURNS TABLE(
  day timestamptz,
  total_quizzes_taken bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('day', created_at AT TIME ZONE p_timezone) AT TIME ZONE p_timezone AS day,
    COUNT(*) AS total_quizzes_taken
  FROM quiz_results
  WHERE user_id = p_user_id
    AND created_at >= p_start_date
    AND created_at < p_end_date
  GROUP BY day
  ORDER BY day;
END;
$$;