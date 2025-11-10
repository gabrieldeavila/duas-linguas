create or replace function public.match_book_suggestions()
returns table (
  id uuid,
  title text,
  author text,
  cover_image_url text,
  description text,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_embedding vector(384);
  v_lang language;
begin
  -- get user's embedding and language
  select embedding, language_learning
  into v_user_embedding, v_lang
  from preferences
  where user_id = v_user_id;

  if v_user_embedding is null then
    raise notice 'User embedding not found.';
    return;
  end if;

  -- return similar books based on user's embedding and language
  return query
  select
    b.id,
    b.title,
    b.author,
    b.cover_image_url,
    b.description,
    m.similarity
  from match_table_embeddings('books', v_user_embedding, v_lang) as m
  join books b on b.id = m.id
  join book_categories bc on b.id = bc.book_id
  where b.id not in (
    select book_id from book_focus where user_id = v_user_id
  ) and bc.category_id not in (
    select favorite_categories.category_id
    from favorite_categories
    where user_id = v_user_id
  ) and b.status = 'done'
  order by m.similarity asc
  limit 10;
end;
$$;

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
  and b.id not in (
    select book_id from book_focus where user_id = auth.uid()
  )
  and b.status = 'done'
  limit p_limit
  offset p_offset;
$$;
