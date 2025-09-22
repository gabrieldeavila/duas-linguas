import { createClient } from "@supabase";

// @ts-expect-error - Supabase AI is not yet available in the official JS client
const session = new Supabase.ai.Session("gte-small");

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  if (!supabaseUrl || !supabaseRoleKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { ids, table, contentColumn, embeddingColumn, secretKey } =
    await req.json();

  if (secretKey && secretKey !== Deno.env.get("INTERNAL_SECRET_KEY")) {
    console.error("Unauthorized: Invalid secret key");
    return new Response("Unauthorized", { status: 401 });
  }

  if (!ids || !table || !contentColumn || !embeddingColumn) {
    return new Response(
      JSON.stringify({
        error: "Missing required parameters.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseRoleKey);

  const { data: rows, error: selectError } = await supabase
    .from(table)
    .select(`id, ${contentColumn}`)
    .in("id", ids);

  if (selectError) {
    console.log(selectError, "selectError");

    return new Response(JSON.stringify({ error: selectError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const row of rows) {
    const { id, [contentColumn]: content } = row as never;

    if (!content) {
      console.error(`No content available in column '${contentColumn}'`);
      continue;
    }

    if (!id) {
      console.error(`No id available in column 'id'`);
      continue;
    }

    const output = (await session.run(content, {
      mean_pool: true,
      normalize: true,
    })) as number[];

    const embedding = JSON.stringify(output);

    if (!embedding) {
      console.error(`No embedding generated for id ${id}`);
      continue;
    }

    const { error } = await supabase
      .from(table)
      .update({
        [embeddingColumn]: embedding,
      })
      .eq("id", id);

    if (error) {
      console.error(
        `Failed to save embedding on '${table}' table with id ${id}`
      );

      console.error(error);
    }

    console.log(
      `Generated embedding ${JSON.stringify({
        table,
        id,
        contentColumn,
        embeddingColumn,
      })}`
    );
  }

  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:55431/functions/v1/embed' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
