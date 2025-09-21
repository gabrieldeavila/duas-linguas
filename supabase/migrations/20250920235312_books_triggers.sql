CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

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

create function anon_key()
returns text
language plpgsql
security definer
as $$
declare
  secret_value text;
begin
  select decrypted_secret into secret_value from vault.decrypted_secrets where name = 'anon_key';
  return secret_value;
end;
$$;

CREATE FUNCTION internal_secret_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  SELECT decrypted_secret INTO secret_value FROM vault.decrypted_secrets WHERE name = 'internal_secret_key';
  RETURN secret_value;
END;
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

select
  cron.schedule(
    'bulk_chapters_every_quarter_hour',
    '*/15 * * * *',
    $$
    select
      net.http_post(
          url:= supabase_url() || '/functions/v1/bulk_chapters',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || anon_key()
          ),
          body:=jsonb_build_object(
            'secretKey', internal_secret_key()
          )
      ) as request_id;
    $$
  );

