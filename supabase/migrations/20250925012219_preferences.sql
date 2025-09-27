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
  UPDATE preferences
  SET did_setup = TRUE
  WHERE user_id = auth.uid();
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
