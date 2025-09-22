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

create function embed_inserted()
returns trigger
language plpgsql
as $$
declare
  content_column text = TG_ARGV[0];
  embedding_column text = TG_ARGV[1];
  batch_size int = case when array_length(TG_ARGV, 1) >= 3 then TG_ARGV[2]::int else 15 end;
  timeout_milliseconds int = case when array_length(TG_ARGV, 1) >= 4 then TG_ARGV[3]::int else 5 * 60 * 1000 end;
  batch_count int = ceiling((select count(*) from inserted) / batch_size::float);
begin
  -- Loop through each batch and invoke an edge function to handle the embedding generation
  for i in 0 .. (batch_count-1) loop
  perform
    net.http_post(
      url := supabase_url() || '/functions/v1/embed',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key()
      ),
      body := jsonb_build_object(
        'ids', (select json_agg(ds.id) from (select id from inserted limit batch_size offset i*batch_size) ds),
        'table', TG_TABLE_NAME,
        'contentColumn', content_column,
        'embeddingColumn', embedding_column,
        'secretKey', internal_secret_key()
      ),
      timeout_milliseconds := timeout_milliseconds
    );
  end loop;

  return null;
end;
$$;

-- add embed for table excerpts
create trigger embed_excerpts_after_insert
after insert on excerpts
referencing new table as inserted
for each statement
execute function embed_inserted('content', 'embedding');
