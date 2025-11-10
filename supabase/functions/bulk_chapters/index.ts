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

  if (secretKey !== Deno.env.get("INTERNAL_SECRET_KEY")) {
    console.error("Unauthorized: Invalid secret key");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Starting bulk chapter processing...");

  // Create a Supabase client with the Auth context of the logged in user.
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL")!,
    // Supabase API ANON KEY - env var exported by default.
    SUPABASE_SERVICE_ROLE_KEY!,
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
    .order("number", { ascending: true })
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

      const prompt = `
You are an expert copywriter who writes tweet-style hooks.

Book: "${bookTitle}" by ${author}
Chapter ${chapterNumber}: "${chapterTitle}"
Language: "${language}"

❌ Do NOT mention the author or refer to the author in any way.

🎯 Task:
Generate 10–15 short, snippets that express the ideas of the chapter in a compelling way to engage readers.

🧠 Guidelines:
- Each snippet should be 150–280 characters, 1–2 short sentences (15–30 words)
- Start directly with the idea; no fillers or introductions
- Each snippet should convey a **key lesson, insight, event, concept, or character action** from the chapter
- Include references to important events, names, characters, or concepts from the chapter
- Vary the tone: reflective, provocative, assertive, or intriguing
- Make the snippets spark curiosity or emotion, engaging the reader
- Each snippet must be unique; avoid repeating words, sentence structures, or ideas

🧩 Quality check before returning:
- No repetition or similar phrasing
- All sound like authentic author insights

📦 Output only this JSON array:
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
        schema: z.object({
          snippets: z.array(
            z.object({
              snippet: z.string(),
            })
          ),
        }),
      });

      console.log(
        "finished generating excerpts!",
        chapterExcerpts.object.snippets
      );

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
You are a skilled educator who designs engaging multiple-choice questions based on book chapters.

Book: "${bookTitle}" by ${author}
Chapter ${chapterNumber}: "${chapterTitle}"
Language: "${language}"

Context snippets from the chapter:
${chapterSnippets.map((s) => `- ${s.snippet}`).join("\n")}

🎯 Task:
Create 4–8 multiple-choice questions that test understanding and language awareness:
- 5 comprehension questions about the ideas, logic, or key details
- 3 grammar or vocabulary questions inspired by the writing style in the snippets

🧠 Guidelines:
- Each question must include:
  • "question": the question text  
  • "options": 4 distinct answer choices labeled A, B, C, D  
  • "answer": the correct option letter (A–D)  
  • "explanation": a brief explanation of why that answer is correct  

- Use the ${readingLevel} style: ${questionsStyle[readingLevel.toLowerCase() as keyof typeof questionsStyle]}
- All text must be written in "${language}"
- Keep the tone natural — like a teacher guiding students, not an exam generator
- Vary the structure of the questions (e.g., some inferential, some direct, some stylistic)
- Don’t repeat the same correct answer letter across all questions

🚫 Do NOT:
- Repeat identical question structures
- Include meta explanations or extra text outside the JSON

📦 Output format:
{
  "questions":
  [
    {
      "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A",
    "explanation": "Short explanation of the answer"
    },
    ...
    ]
}
`;
      const chapterQuestions = await generateObject({
        model: model(aiType),
        prompt: promptQuestions,
        schema: z.object({
          questions: z.array(
            z.object({
              question: z.string().min(1).max(300),
              options: z.array(z.string().min(1).max(150)).length(4),
              answer: z.enum(["A", "B", "C", "D"]),
              explanation: z.string(),
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
              explanation: string;
            }) => ({
              chapter_id: chapter.id,
              question: question.question,
              options: question.options,
              answer: question.answer,
              explanation: question.explanation,
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

        // if all chapters for the book are done, set book status to done
        const { data: remainingChapters } = await supabaseClient
          .from("chapters")
          .select("id")
          .eq("book_id", chapter.book_id)
          .neq("status", "done");

        if (remainingChapters && remainingChapters.length === 0) {
          await supabaseClient
            .from("books")
            .update({ status: "done" })
            .eq("id", chapter.book_id);
          console.log(
            `All chapters for book ID ${chapter.book_id} are done. Book status set to done.`
          );
        }
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
