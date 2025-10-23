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

-- table to know which chapter the user is reading and which excerpt
create table if not exists book_focus (
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  book_id uuid references books(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  excerpt_id uuid references excerpts(id) on delete cascade,
  updated_at timestamptz default now(),
  primary key (user_id, book_id)
);

create or replace function public.set_book_focus(
  p_book_id uuid,
  p_chapter_number int default null,
  p_excerpt_id uuid default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing record;
  v_chapter_id uuid;
  v_excerpt_id uuid;
begin
  -- check if there's already a focus for this user/book
  select * into v_existing
  from book_focus
  where user_id = v_user_id and book_id = p_book_id;

  if found then
    -- if record exists, only update if new values were provided
    v_excerpt_id := coalesce(p_excerpt_id, v_existing.excerpt_id);
  end if;
  
  -- find first chapter/excerpt if not provided
  if p_chapter_number is null then
      select id into v_chapter_id
      from chapters
      where book_id = p_book_id
      and status = 'done'
      order by number asc, created_at asc
      limit 1;
  else
      select id into v_chapter_id
      from chapters
      where book_id = p_book_id
      and number = p_chapter_number;
  end if;

  if p_excerpt_id is null then
      select id into v_excerpt_id
      from excerpts
      where chapter_id = v_chapter_id
      order by order_index asc, created_at asc
      limit 1;
  else
      v_excerpt_id := p_excerpt_id;
  end if;

  insert into book_focus (user_id, book_id, chapter_id, excerpt_id, updated_at)
  values (v_user_id, p_book_id, v_chapter_id, v_excerpt_id, now())
  on conflict (user_id, book_id)
  do update set
    chapter_id = excluded.chapter_id,
    excerpt_id = excluded.excerpt_id,
    updated_at = now();
end;
$$;

drop table if exists excerpt_read;

-- add rls to book_focus
alter table book_focus enable row level security;

create policy "Users can manage their book focus" on book_focus
  for all
  using (user_id = auth.uid());

-- add col "start_chapter" and "end_chapter" to table books, its an integer
ALTER TABLE books
ADD COLUMN IF NOT EXISTS start_chapter INT,
ADD COLUMN IF NOT EXISTS end_chapter INT;

-- update start_chapter and end_chapter based on chapters table
UPDATE books b
SET start_chapter = sub.min_number,
    end_chapter = sub.max_number
FROM (
  SELECT book_id,
         MIN(number) AS min_number,
         MAX(number) AS max_number
  FROM chapters
  GROUP BY book_id
) sub
WHERE b.id = sub.book_id;

-- add trigger to update start_chapter and end_chapter on chapters insert
CREATE OR REPLACE FUNCTION update_book_chapter_range()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE books
  SET start_chapter = LEAST(COALESCE(start_chapter, NEW.number), NEW.number),
      end_chapter = GREATEST(COALESCE(end_chapter, NEW.number), NEW.number)
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_book_chapter_range
AFTER INSERT ON chapters
FOR EACH ROW
EXECUTE FUNCTION update_book_chapter_range();
