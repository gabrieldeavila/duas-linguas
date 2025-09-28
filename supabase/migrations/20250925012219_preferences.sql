-- create table of preferences
CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  embedding vector(384),
  did_setup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- favorite categories
CREATE TABLE IF NOT EXISTS favorite_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_preferences_updated_at
BEFORE UPDATE ON preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorite_categories_updated_at
BEFORE UPDATE ON favorite_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS excerpt_read (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  excerpt_id UUID NOT NULL REFERENCES excerpts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, excerpt_id)
);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE excerpt_read ENABLE ROW LEVEL SECURITY;

-- only user can access their preferences
CREATE POLICY "Users can access their own preferences" ON preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- only user can access their favorite categories
CREATE POLICY "Users can access their own favorite categories" ON favorite_categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- only user can access their excerpt read
CREATE POLICY "Users can access their own excerpt read" ON excerpt_read
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- trigger after insert a category to update did_setup to true
CREATE OR REPLACE FUNCTION set_did_setup_true()
RETURNS TRIGGER AS $$
BEGIN
-- only updates if there is at least one favorite category
  IF EXISTS (
    SELECT 1
    FROM favorite_categories
    WHERE user_id = auth.uid()
  ) THEN
    UPDATE preferences
    SET did_setup = TRUE
    WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_favorite_category
AFTER INSERT ON favorite_categories
FOR EACH STATEMENT
EXECUTE FUNCTION set_did_setup_true();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


create or replace function get_recommendations(p_limit int default 20, lang public.language default 'en')
returns table (
  excerpt_id uuid,
  title text,
  similarity float8,
  category_id uuid
) as $$
declare
  uvec vector; -- holds the user's embedding or a fallback
begin
  -- 1. Try to load existing user embedding
  select embedding into uvec
  from preferences
  where user_id = auth.uid();

  -- 2. If null, bootstrap from favorite categories
  if uvec is null then
    select avg(e.embedding) into uvec
    from excerpts e
    join book_categories bc on e.book_id = bc.book_id
    where bc.category_id in (
      select favorite_categories.category_id
      from favorite_categories
      where user_id = auth.uid()
    ) and e.language = lang;
  end if;

  -- 3. Case A: we now have a vector (from user or categories)
  if uvec is not null then
    return query
    with prefs as (
      select favorite_categories.category_id
      from favorite_categories
      where user_id = auth.uid()
    ),
    excerpts_categories as (
      select e.id, bc.category_id, e.embedding, e.content
      from excerpts e
      join book_categories bc on e.book_id = bc.book_id
      where bc.category_id in (select prefs.category_id from prefs)
    )
    select e.id,
           e.content as title,
           1 - (e.embedding <=> uvec) as similarity,
           e.category_id
    from excerpts_categories e
    where e.id not in (
      select excerpt_read.excerpt_id from excerpt_read where user_id = auth.uid()
    )
    order by (
      (1 - (e.embedding <=> uvec)) * 0.8
      + case when e.category_id in (select prefs.category_id from prefs) then 0.2 else 0 end
    ) desc
    limit p_limit;

  -- 4. Case B: no embedding and no categories → show fallback
  else
    return query
    select e.id,
           e.content as title,
           null::float8 as similarity,
           bc.category_id
    from excerpts e
    join book_categories bc on e.book_id = bc.book_id
    where e.id not in (
      select excerpt_read.excerpt_id from excerpt_read where user_id = auth.uid()
    ) and e.language = lang
    order by e.created_at desc
    limit p_limit;
  end if;
end;
$$ language plpgsql stable;