CREATE EXTENSION IF NOT EXISTS pg_net;

create function supabase_url()
returns text
language plpgsql
security definer
as $$
declare
  secret_value text;
begin
  select decrypted_secret into secret_value from vault.decrypted_secrets where name = 'supabase_url';
  return secret_value;
end;
$$;

CREATE OR REPLACE FUNCTION find_book_chapters()
RETURNS TRIGGER AS $$
BEGIN
  perform net.http_post(
    url := supabase_url()::text || '/functions/v1/init_book_chapters',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', current_setting('request.headers')::json->>'authorization'
    ),
    body := jsonb_build_object(
      'bookId', NEW.id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER trigger_find_book_chapters
AFTER INSERT ON books
FOR EACH ROW
EXECUTE FUNCTION find_book_chapters();
