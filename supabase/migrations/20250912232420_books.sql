CREATE TYPE PUBLIC.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date DATE,
  cover_image_url TEXT,
  language TEXT NOT NULL,
  difficulty_level PUBLIC.difficulty_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  number INT,
  difficulty_level PUBLIC.difficulty_level,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_chapters_updated_at
BEFORE UPDATE ON chapters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS excerpts (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_excerpts_updated_at
BEFORE UPDATE ON excerpts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  excerpt_id UUID NOT NULL REFERENCES excerpts(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  book_id UUID NOT NULL REFERENCES books(id),
  question TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  difficulty_level PUBLIC.difficulty_level,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE PUBLIC.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE PUBLIC.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE PUBLIC.excerpts ENABLE ROW LEVEL SECURITY;
ALTER TABLE PUBLIC.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authorized crud access" ON PUBLIC.books
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow authorized crud access" ON PUBLIC.chapters
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow authorized crud access" ON PUBLIC.excerpts
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow authorized crud access" ON PUBLIC.questions
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow read access to everyone" ON PUBLIC.books
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

CREATE POLICY "Allow read access to everyone" ON PUBLIC.chapters
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

CREATE POLICY "Allow read access to everyone" ON PUBLIC.excerpts
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

CREATE POLICY "Allow read access to everyone" ON PUBLIC.questions
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

CREATE OR REPLACE FUNCTION auto_set_excerpt_book_id()
RETURNS TRIGGER AS $$
DECLARE
  chapter_book UUID;
BEGIN
  -- Get the book_id from the chapter
  SELECT book_id INTO chapter_book
  FROM chapters
  WHERE id = NEW.chapter_id;

  -- Raise error if chapter doesn't exist
  IF chapter_book IS NULL THEN
    RAISE EXCEPTION 'Chapter % does not exist', NEW.chapter_id;
  END IF;

  -- Set the book_id
  NEW.book_id := chapter_book;

  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION auto_set_question_chapter_and_book_id()
RETURNS TRIGGER AS $$
DECLARE
  excerpt_chapter UUID;
  excerpt_book UUID;
BEGIN
  -- Get chapter and book from excerpt
  SELECT chapter_id, book_id INTO excerpt_chapter, excerpt_book
  FROM excerpts
  WHERE id = NEW.excerpt_id;

  IF excerpt_chapter IS NULL THEN
    RAISE EXCEPTION 'Excerpt % does not exist', NEW.excerpt_id;
  END IF;

  NEW.chapter_id := excerpt_chapter;
  NEW.book_id := excerpt_book;

  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER set_question_chapter_and_book_id
BEFORE INSERT ON questions
FOR EACH ROW
EXECUTE FUNCTION auto_set_question_chapter_and_book_id();

