create or replace function public.update_preference_embedding_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing vector(384);
  v_new vector(384);
  v_result vector(384);
begin
  -- Get the current embedding of the user
  select embedding into v_existing
  from preferences
  where user_id = auth.uid();

  -- Get the embedding of the new focused book
  select embedding into v_new
  from books
  where id = new.book_id;

  if v_new is null then
    return new;
  end if;

  if v_existing is null then
    -- If no existing embedding, set directly
    update preferences
    set embedding = v_new
    where user_id = auth.uid();
  else
    -- Weighted decay blend:
    -- v_result;
    select AVG(embedding) into v_result
    from (
      select 
        v_existing::vector as embedding
      union all
      select 
        v_new::vector as embedding
    );

    update preferences
    set embedding = v_result
    where user_id = auth.uid();
  end if;

  return new;
end;
$$;

create trigger trg_update_preference_embedding_on_insert
after insert on book_focus
for each row
execute function public.update_preference_embedding_on_insert();

create or replace function match_table_embeddings(
  table_name text,
  embedding vector(384),
  lang language
)
returns table (id uuid, similarity float)
language plpgsql
as $$
#variable_conflict use_variable
declare
  query text;
  match_threshold float := 0.5;
begin
  query := format(
    'select table_name.id, embedding <#> $1 as similarity
     from %I as table_name
     where embedding <#> $1 < -$2
     and table_name.language = $3
     order by similarity;',
    table_name
  );

  -- Execute the query dynamically
  return query execute query using embedding, match_threshold, lang;
end;
$$;

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
  )
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
  limit p_limit
  offset p_offset;
$$;

-- function categories not present in user's favorite categories
create or replace function public.get_unfavorited_categories(p_limit int default 20, p_offset
  int default 0, p_language public.language default null) 
returns setof public.categories
language sql
as $$
  select *
  from categories c
  where c.language = coalesce(p_language, c.language)
  and c.id not in (
    select fc.category_id
    from favorite_categories fc
    where fc.user_id = auth.uid()
  )
  limit p_limit
  offset p_offset;
$$; 