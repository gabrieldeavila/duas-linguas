# Lesson 5: Creating the magic

In this lesson, we will create the magic that makes our application work.

pnpm dlx shadcn@latest add table
npx supabase gen types typescript --local > ./app/types/database.types.ts

pnpm dlx shadcn@latest add pagination
