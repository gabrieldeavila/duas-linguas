import { createClient } from "@supabase";
import { corsHeaders } from "../_shared/cors.ts";
import { getModel } from "../_shared/ai.ts";
import { generateObject } from "ai";
import { z } from "@zod";

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { secretKey } = await req.json();

  if (secretKey && secretKey !== Deno.env.get("INTERNAL_SECRET_KEY")) {
    console.error("Unauthorized: Invalid secret key");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Starting bulk chapter processing...");

  // Create a Supabase client with the Auth context of the logged in user.
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

  const bulkChapters = await supabaseClient
    .from("chapters")
    .select("*, books(title, author, language)")
    .neq("status", "done")
    .limit(1);

  console.log(`Found ${bulkChapters.data?.length || 0} chapters to process.`);

  if (!bulkChapters.data?.length) {
    return new Response(JSON.stringify({ message: "No chapters to process" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const [aiType, model] = getModel();

  for (const chapter of bulkChapters.data) {
    console.log(`Processing chapter ${chapter.id}: ${chapter.title}`);

    try {
      if (
        chapter.status === "processing" &&
        chapter.updated_at &&
        new Date().getTime() - new Date(chapter.updated_at).getTime() <
          15 * 60 * 1000
      ) {
        console.log(
          `Skipping chapter ${chapter.id} as it is already being processed.`
        );
        continue; // skip chapters that are already being processed and were updated less than 15 minutes ago
      }

      // if status is error, reset error_message
      if (chapter.status === "error") {
        await supabaseClient
          .from("chapters")
          .update({ error_message: null })
          .eq("id", chapter.id);

        // remove existing excerpts and questions
        await supabaseClient
          .from("excerpts")
          .delete()
          .eq("chapter_id", chapter.id);

        await supabaseClient
          .from("questions")
          .delete()
          .eq("chapter_id", chapter.id);
      }

      // set status to in_progress
      await supabaseClient
        .from("chapters")
        .update({ status: "processing" })
        .eq("id", chapter.id);

      const chapterNumber = chapter.number;
      const chapterTitle = chapter.title;
      const bookTitle = chapter.books?.title;
      const author = chapter.books?.author;
      const language = chapter.books?.language;
      const readingLevel = chapter.difficulty_level || "Intermediate";

      const chapterPromptLevel = {
        beginner:
          "Use only common, everyday words. Keep sentences short (max 10–12 words). No idioms, no figurative or abstract ideas. Simple cause–effect or descriptive statements only.",
        intermediate:
          "Use natural, conversational tone with some variety in sentence structure. Include mild emotion or reflection, but avoid heavy metaphors or literary expressions.",
        advanced:
          "Use rich, expressive language with figurative elements, varied rhythm, and complex syntax. Allow for subtle emotions, metaphors, and layered meaning.",
      };

      const prompt = `
You are an assistant that creates tweet-style hooks for a book chapter.
The book is "${bookTitle}" by ${author}.
Chapter ${chapterNumber} is titled "${chapterTitle}".

Generate 8–10 snippets that explain or capture this chapter.

Requirements:
- Each between 150 and 280 characters (like a tweet), including spaces
- 1–2 sentences max — short, punchy, emotionally engaging
- Must spark curiosity, create suspense, or leave an emotional pull
- Begin directly with the idea, no intros or fillers
- Written in the language of the book: "${language}"
- Avoid repeating words, phrases, or sentence structures
- Make it fun and scroll-stopping
- Use the ${readingLevel} style: ${chapterPromptLevel[readingLevel.toLowerCase() as keyof typeof chapterPromptLevel]}
- Each snippet must stand alone and make sense without context
- Avoid clichés and generic inspiration

Before returning, review all snippets to ensure:
- Diversity in tone, rhythm, and ideas
- No repetition
- Compliance with reading level

Return only this JSON array:
[
  { "snippet": "Snippet text" },
  { "snippet": "Snippet text" },
  ...
]
`;
      console.log("start generating excerpts!");
      const chapterExcerpts = await generateObject({
        model: model(aiType),
        prompt,
        temperature: 0.75,
        schema: z.object({
          snippets: z.array(
            z.object({
              snippet: z.string(),
            })
          ),
        }),
      });

      console.log("finished generating excerpts!", chapterExcerpts.object.snippets);

      // insert excerpts into excerpts table
      const { error } = await supabaseClient.from("excerpts").insert(
        chapterExcerpts.object.snippets.map(
          (excerpt: { snippet: string }, index: number) => ({
            chapter_id: chapter.id,
            content: excerpt.snippet,
            order_index: index + 1,
          })
        )
      );

      const chapterSnippets = chapterExcerpts.object.snippets;

      const questionsStyle = {
        beginner: "simple, short sentences, easy vocabulary",
        intermediate:
          "medium-length sentences, natural flow, moderately rich vocabulary",
        advanced: "longer sentences, rich vocabulary, literary style",
      };

      const promptQuestions = `
You are an assistant that creates multiple-choice questions based on a book chapter.
The book is "${bookTitle}" by ${author}.
Chapter ${chapterNumber} is titled "${chapterTitle}".
Use the following snippets from the chapter as context:
${chapterSnippets.map((s) => `- ${s.snippet}`).join("\n")}

Generate 4 - 8 multiple-choice questions about this chapter:
- 5 comprehension questions about the content
- 3 grammar or vocabulary questions based on the language used in the snippets

Each question should include:
- "question": the question text
- "options": an array of 4 possible answers labeled with letters A, B, C, D
- "answer": the letter corresponding to the correct option (A, B, C, or D)
- "why": a short explanation of why this answer is correct
- Use the ${readingLevel} style: ${questionsStyle[readingLevel.toLowerCase() as keyof typeof questionsStyle]}

All questions and answers must be written in the language of the book ("${language}").
Return an array of objects like this:
[
  {
    "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A"
  },
  ...
]
Do not return the same answer letter for all questions.

Do not include explanations.
`;
      const chapterQuestions = await generateObject({
        model: model(aiType),
        prompt: promptQuestions,
        temperature: 0.6,
        schema: z.object({
          questions: z.array(
            z.object({
              question: z.string().min(1).max(300),
              options: z.array(z.string().min(1).max(150)).length(4),
              answer: z.enum(["A", "B", "C", "D"]),
            })
          ),
        }),
      });

      // insert questions into questions table
      const { error: questionsError } = await supabaseClient
        .from("questions")
        .insert(
          chapterQuestions.object.questions.map(
            (question: {
              question: string;
              options: string[];
              answer: string;
            }) => ({
              chapter_id: chapter.id,
              question: question.question,
              options: question.options,
              answer: question.answer,
            })
          )
        );

      // set status to done
      await supabaseClient
        .from("chapters")
        .update({ status: "done" })
        .eq("id", chapter.id);

      if (error || questionsError) {
        console.error(
          "Error inserting excerpts or questions:",
          error || questionsError
        );
        await supabaseClient
          .from("chapters")
          .update({
            status: "error",
            error_message: (error || questionsError)?.message,
          })
          .eq("id", chapter.id);
      } else {
        console.log(
          `Processed chapter ${chapter.id}: ${chapterTitle} - ${chapterExcerpts.object.snippets.length} excerpts and ${chapterQuestions.object.questions.length} questions added.`
        );
        await supabaseClient
          .from("chapters")
          .update({ status: "done" })
          .eq("id", chapter.id);
      }
    } catch (err) {
      console.error("Error processing chapter:", err);
      await supabaseClient
        .from("chapters")
        .update({ status: "error", error_message: (err as Error).message })
        .eq("id", chapter.id);
    }
  }

  console.log("Bulk chapter processing completed.");

  return new Response(JSON.stringify({ success: "true" }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:55431/functions/v1/bulk_chapters' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
