CREATE TYPE PUBLIC.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE PUBLIC.language AS ENUM ('en', 'es', 'pt');

CREATE TYPE PUBLIC.status AS ENUM ('preparing', 'processing', 'done', 'error');

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date DATE,
  cover_image_url TEXT,
  status PUBLIC.status NOT NULL DEFAULT 'preparing',
  language PUBLIC.language NOT NULL,
  error_message TEXT,
  chapter_start INT DEFAULT 1 NOT NULL,
  chapter_end INT DEFAULT 5 NOT NULL,
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
  status PUBLIC.status NOT NULL DEFAULT 'preparing',
  error_message TEXT,
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
  order_index INT,
  status PUBLIC.status NOT NULL DEFAULT 'preparing',
  error_message TEXT,
  difficulty_level PUBLIC.difficulty_level,
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

-- categories book many-to-many
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  language PUBLIC.language NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS book_categories (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, category_id)
);

-- add role_permissions
INSERT INTO public.role_permissions (role, permission)
VALUES
  ('admin', 'editor.manage');

-- create view for book with categories
CREATE OR REPLACE VIEW public.vw_book_categories with (security_invoker = true) AS
SELECT
  books.title as book_title,
  books.id as book_id,
  categories.id AS category_id,
  categories.name AS category_name,
  book_categories.created_at,
  book_categories.id
FROM
  book_categories
JOIN books ON book_categories.book_id = books.id
JOIN categories ON book_categories.category_id = categories.id;

-- add rls
ALTER TABLE PUBLIC.book_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authorized crud access" ON PUBLIC.book_categories
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow read access to everyone" ON PUBLIC.book_categories
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

-- to categories
ALTER TABLE PUBLIC.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authorized crud access" ON PUBLIC.categories
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow read access to everyone" ON PUBLIC.categories
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);

