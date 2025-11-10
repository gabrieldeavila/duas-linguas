ALTER TABLE book_focus
ADD COLUMN did_finish_all_quizzes BOOLEAN DEFAULT FALSE;

-- function to update finish_all_quizzes based on quizzes completion
CREATE OR REPLACE FUNCTION update_finish_all_quizzes()
RETURNS TRIGGER AS $$
DECLARE
    v_num_unique_quizzes_passed INT;
    v_max_quizzes INT;
BEGIN
    SELECT COUNT(DISTINCT qr.chapter_id) INTO v_num_unique_quizzes_passed
    FROM quiz_results as qr
    WHERE qr.user_id = auth.uid()
      AND qr.passed = TRUE
      AND qr.book_id = NEW.book_id;

    SELECT end_chapter INTO v_max_quizzes
    FROM books
    WHERE id = NEW.book_id;

    IF v_num_unique_quizzes_passed >= v_max_quizzes THEN
        UPDATE book_focus
        SET did_finish_all_quizzes = TRUE
        WHERE user_id = auth.uid() AND book_id = NEW.book_id;
    ELSE
        UPDATE book_focus
        SET did_finish_all_quizzes = FALSE
        WHERE user_id = auth.uid() AND book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_finish_all_quizzes
AFTER INSERT ON quiz_results
FOR EACH ROW
EXECUTE FUNCTION update_finish_all_quizzes();

-- update previous records to set did_finish_all_quizzes correctly
UPDATE book_focus bf
SET did_finish_all_quizzes = subquery.finished
FROM (
    SELECT qr.user_id, qr.book_id,
           CASE WHEN COUNT(DISTINCT qr.chapter_id) >= b.end_chapter THEN TRUE ELSE FALSE END AS finished
    FROM quiz_results qr
    JOIN books b ON qr.book_id = b.id
    WHERE qr.passed = TRUE
    GROUP BY qr.user_id, qr.book_id, b.end_chapter
) AS subquery
WHERE bf.user_id = subquery.user_id AND bf.book_id = subquery.book_id;