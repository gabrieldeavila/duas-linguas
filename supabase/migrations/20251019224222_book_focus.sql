-- drop trigger embed_excerpts_after_insert
drop trigger if exists embed_excerpts_after_insert on excerpts;

-- delete column embedding from excerpts table
ALTER TABLE excerpts
DROP COLUMN IF EXISTS embedding;

-- add column embedding to table books
ALTER TABLE books
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- add column embedding and description to table chapters
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS embedding VECTOR(384),
ADD COLUMN IF NOT EXISTS description TEXT;

-- add trigger function to embed inserted books
CREATE TRIGGER embed_books_after_insert
AFTER INSERT ON books
REFERENCING NEW TABLE AS INSERTED
FOR EACH STATEMENT
EXECUTE FUNCTION embed_inserted('description', 'embedding');

-- add trigger function to embed inserted chapters
CREATE TRIGGER embed_chapters_after_insert
AFTER INSERT ON chapters
REFERENCING NEW TABLE AS INSERTED
FOR EACH STATEMENT
EXECUTE FUNCTION embed_inserted('description', 'embedding');

-- drop function get_recommendations
DROP FUNCTION IF EXISTS public.get_recommendations

-- returns books that are related to the favorite_categories of the user
CREATE OR REPLACE FUNCTION public.get_recommendations(p_limit int default 20, p_offset
  int default 0) 
returns table (
  id uuid,
  title text,
  author text,
  description text,
  cover_image_url text,
  difficulty_level public.difficulty_level
)
language sql
as $$
  select
    b.id,
    b.title,
    b.author,
    b.description,
    b.cover_image_url,
    b.difficulty_level
  from books b
  join book_categories bc on b.id = bc.book_id
  where bc.category_id in (
    select favorite_categories.category_id
    from favorite_categories
    where user_id = auth.uid()
  )
  limit p_limit
  offset p_offset;
$$;
