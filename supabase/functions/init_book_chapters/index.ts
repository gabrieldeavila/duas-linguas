import { createClient } from "@supabase";
import { corsHeaders } from "../_shared/cors.ts";
import { getModel } from "../_shared/ai.ts";
import { generateObject } from "ai";
import { z } from "@zod";

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { bookId } = await req.json();

    const book = await supabaseClient
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    // update status to in_progress
    await supabaseClient
      .from("books")
      .update({ status: "processing" })
      .eq("id", bookId);

    const chapterStart = book.data?.chapter_start;
    const chapterEnd = book.data?.chapter_end;
    const bookTitle = book.data?.title;
    const author = book.data?.author;
    const language = book.data?.language;

    if (!chapterStart || !chapterEnd) {
      throw new Error("Book does not have chapter range defined");
    }

    const [aiType, model] = getModel();

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

    // insert chapters into chapters table
    const { data, error } = await supabaseClient.from("chapters").insert(
      bookChapters.object.chapters.map(
        (chapter: { chapter: number; title: string }) => ({
          book_id: bookId,
          number: chapter.chapter,
          title: chapter.title,
        })
      )
    );

    return new Response(JSON.stringify({ data, error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:55431/functions/v1/init_book_chapters' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
