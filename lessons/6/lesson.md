# Lesson 6: Creating Edge Functions, Embeddings and Cron Jobs with Supabase + OpenAI

In this lesson, we will create the edge functions that will be used to create embeddings and to create the quizzes.

We will also create a cron job that will run every day and will check if there are new exerpts that need to be processed.

## 1. Edge Functions

Edge functions are serverless functions that run on the edge. They are perfect for our use case because they are fast and scalable.
You can read more about edge functions [here](https://supabase.com/docs/guides/functions).

To create our first edge function, run the following command:

```bash
supabase functions new init_book_chapters
```

It will create a new folder called `functions` with a subfolder called `init_book_chapters`.

In this folder, you will find a file called `index.ts`. This is where we will write our function.

Also, you will find a file called `deno.json`. This file is used to configure the dependencies of our function.

I like to create a folder called `_shared` where I put all the code that I want to share between functions. In this case, I created a file called `ai.ts` and other called `cors.ts`.

To avoid TS errors, add the following to the `deno.json` file on the root of the project:

```json
{
  "imports": {
    "@ai-sdk/openai": "npm:@ai-sdk/openai@2.0.32"
  }
}
```

I recommend creating a `.env` file in the root of the project and adding the following variables:

```
OPENAI_API_KEY=your_openai_api_key
INTERNAL_SECRET_KEY=your_internal_secret_key # we will use this to secure our edge functions, more on this later
```

If you don't know what Deno is, you can read more about it [here](https://deno.land/manual/getting_started/what_is_deno).

But basically, Deno is a runtime for JavaScript and TypeScript that is secure by default and has a lot of features that make it easy to write serverless functions.

I recommend installing the extension for VSCode called [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) that will help you with autocompletion and linting.

### 1.1 Creating the `init_book_chapters` function

The `init_book_chapters` function will be responsible for creating the chapters for a book.

It will be triggered when a new book is added to the database.

To do this, we need to create a function on the `books` table that will call our edge function.

You can check the migration file `20250920235312_books_triggers`, which creates the trigger.

But, we need to have an extension that allows us to make HTTP requests from the database. For this, we can use the `pg_net` extension.

And as we will also create a cron job that will call an edge function, we will also need the `pg_cron` extension.

Finally, we will require the `vector` extension to be able to store the embeddings.

```sql
create extension if not exists "pg_net";
create extension if not exists "pg_cron";
create extension if not exists "vector";
```

Vault
Supabase has a built-in integration, Vault, that allows us to store secrets securely.

In our migration file, lets create the secrets that we will use in our edge functions.

```sql
select vault.create_secret(
  'http://host.docker.internal:55431',
  'supabase_url'
);

select vault.create_secret(
  'A_REALLY_LONG_KEY_YOU_SHOULD_NOT_SHARE',
  'internal_secret_key'
);

select vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  'anon_key'
);
```

The supabase_url is the URL of our Supabase project. As this will be called from the database, we need to use `host.docker.internal` instead of `localhost`.

The internal_secret_key is a key that we will use to secure our edge functions. We will check that the request to the edge function contains this key. To get some secure secret, you can use [this](https://1password.com/pt/password-generator) generator.

The anon_key is the anon key of our Supabase project. Do you remember the url that we get when we run `supabase start`? This is the key you should use.

Now that we have the extensions and the secrets, I'll be creating some helper functions to access these value easily.

```sql
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
```

For the trigger, we will create a function that will call our edge function.

```sql
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
```

Basically, when a new book is added, the function `find_book_chapters` will be called, which will make a POST request to our edge function with the book ID.

Now, let's implement the edge function.

I'll try only to show the most important parts of the code. You can check the full code in the `supabase/functions/init_book_chapters/index.ts` file.

You need to have the following imports in your `deno.json` file:

```json
{
  "imports": {
    "@supabase": "npm:@supabase/supabase-js@2",
    "@ai-sdk/openai": "npm:@ai-sdk/openai@2.0.32",
    "ai": "npm:ai@5.0.47",
    "@zod": "npm:zod@4.1.9",
    "axiod": "https://deno.land/x/axiod@0.26.2/mod.ts"
  }
}
```

Then, in your `index.ts` file, you can write the following code:

```typescript
const bookChapters = await generateObject({
  model: model(aiType),
  prompt: `
You are an assistant that generates chapter names for books.
The book "${bookTitle}" has chapters from number ${chapterStart} to ${chapterEnd}.
The author of the book is ${author}.
Generate chapter names in the language of the book, which is "${language}".
Return an array of objects in this format:
[
  { "chapter": 1, "title": "Chapter Name" },
  { "chapter": 2, "title": "Chapter Name" },
  ...
]
Only provide the chapter numbers and titles, no extra explanations.
`,
  temperature: 0.65,
  schema: z.object({
    chapters: z.array(
      z.object({
        chapter: z.number().min(chapterStart).max(chapterEnd),
        title: z.string().min(1).max(100),
      })
    ),
  }),
});
```

The model comes from the `getModel` function that I created in the `_shared/ai.ts` file.

This is straightforward:

```ts
import { OpenAIProvider, createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

export function getModel(model?: string): [string, OpenAIProvider] {
  return [model ?? "gpt-5-mini", openai];
}
```

By default we will use the `gpt-5-mini` model, but you can change it by passing the model name in the request.

To get an OpenAI key, you can create an account [here](https://platform.openai.com/signup).

This code will generate the chapter names for the book using the OpenAI API.

Then, we will insert the chapters into the database.

```typescript
const { data, error } = await supabaseClient.from("chapters").insert(
  bookChapters.object.chapters.map(
    (chapter: { chapter: number; title: string }) => ({
      book_id: bookId,
      number: chapter.chapter,
      title: chapter.title,
    })
  )
);
```

I also added a call for the `bulk_chapters` function that will create the embeddings for the chapters.

### 1.2 Creating the `bulk_chapters` function

The `bulk_chapters` function will be responsible for creating excerpts and questions for each chapter.

To create this function, run the following command:

```bash
supabase functions new bulk_chapters
```

The biggest difference with the previous function is that this function will be also triggered by a cron job.

There are two ways to execute this function: either by calling it directly from the database or by using a cron job.

To create a cron job, you can use the `pg_cron` extension that we installed earlier.

I created a cron job that runs every quarter hour and calls the `bulk_chapters` function.
Probably, in the future, I will change this to run every hour or more.

It looks like this:

```sql
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
```

You can check the full code in the `supabase/functions/bulk_chapters/index.ts` file.

One think that changes is that we need to check if the request contains the `secretKey` that we defined in our `.env` file.

```typescript
const { secretKey } = await req.json();

if (secretKey && secretKey !== Deno.env.get("INTERNAL_SECRET_KEY")) {
  console.error("Unauthorized: Invalid secret key");
  return new Response("Unauthorized", { status: 401 });
}
```

This protects our function from being called by anyone that doesn't have the key.

So, either you have the key or you are an admin user, to call the function.

This also changes our supabase client.

```typescript
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabaseClient = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get("SUPABASE_URL")!,
  // Supabase API ANON KEY - env var exported by default.
  secretKey ? SUPABASE_SERVICE_ROLE_KEY! : Deno.env.get("SUPABASE_ANON_KEY")!,
  // Create client with Auth context of the user that called the function.
  // This way your row-level-security (RLS) policies are applied.
  secretKey
    ? undefined
    : {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
);
```

There is a BIG difference from using the `SUPABASE_SERVICE_ROLE_KEY` and the `SUPABASE_ANON_KEY`.
If you use the `SUPABASE_SERVICE_ROLE_KEY`, you will be able to bypass the RLS policies, so be careful with this key.

And remember, never ever expose this key or the secret key to the client.

## 2. Embeddings

To create the embeddings, we will use Supabase's AI capabilities with the `Supabase.ai.Session("gte-small")` model.

This is the only model that supports embeddings at the moment when using Supabase's Edge Functions.

Do you remember the `vector` extension that we installed earlier?
This extension allows us to store the embeddings in the database.
You can create a column with the `vector` type like this:

```sql
ALTER TABLE excerpts ADD COLUMN embedding vector(384);
```

Since I did not run any migration, I just added this column in the original migration :D

But what is an embedding? And why 384?
An embedding is a numerical representation of text that captures its semantic meaning.
The number 384 is the dimension of the embedding vector produced by the "gte-small" model.
You can read more about embeddings [here](https://supabase.com/docs/guides/ai/quickstarts/generate-text-embeddings).

When will we create the embeddings?
At the moment an excerpt is created.

There are two ways to run the trigger that creates the excerpt: one is by row and the other is by statement.

In this case, I created a trigger that runs by statement, so when multiple excerpts are created, the trigger will run only once.

The big boy that creates the embeddings is the `embed_inserted` function.
Do not be afraid, it is not that complicated.

```sql
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
```

It basically splits the inserted rows into batches and calls an edge function that will create the embeddings for each batch.

A batch size of 15 is a good number, but you can change it if you want.

TG_TABLE_NAME is a special variable that contains the name of the table that triggered the function.
You can read more about it [here](https://www.postgresql.org/docs/current/plpgsql-trigger.html).

inserted is a variable we created in the trigger that contains all the rows that were inserted.

```sql
-- add embed for table excerpts
create trigger embed_excerpts_after_insert
after insert on excerpts
referencing new table as inserted
for each statement
execute function embed_inserted('content', 'embedding');
```

Basically, when new excerpts are added, the `embed_inserted` function will be called, which will call the edge function that will create the embeddings.

Let's add the edge function that will create the embeddings.

```bash
supabase functions new embed
```

I recommend checking the full code in the `supabase/functions/embed/index.ts` file.
But I will show you the most important parts.

```typescript
const session = new Supabase.ai.Session("gte-small");

const { ids, table, contentColumn, embeddingColumn, secretKey } =
  await req.json();

for (const row of rows) {
  const { id, [contentColumn]: content } = row as never;

  const content = row[contentColumn];
  const output = (await session.run(content, {
    mean_pool: true,
    normalize: true,
  })) as number[];
}
```

This code creates the embedding for the content using the "gte-small" model.

Then, we will update the excerpts with the embedding.

```typescript
const { error } = await supabase
  .from(table)
  .update({
    [embeddingColumn]: embedding,
  })
  .eq("id", id);
```

## 3. Next Steps
Now that we have the edge functions and the embeddings, we can create the quizzes for each chapter.

And that is what we will do in the next lesson.