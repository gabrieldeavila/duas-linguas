# Lesson 5: Creating the magic

In this lesson, we will create the magic that makes our application work.

I built a lot of components, so this lesson may be a bit strange. But I will try to explain everything.

If you do not understand something, try looking at the tag of the lesson 5. It might help you.

## 1. What we need to do

What happens in our application is the following:

1. There are books
2. There are categories
3. Each book can belong to one or more categories
4. Each category can have one or more books
5. We need to be able to add, edit and delete books and categories
6. For each book, there will be chapters
7. Each chapter will contain some exerpts - that will be some kind of summary of the original text
8. Each exerpt will contain some questions - these questions will be used to create the quizzes. Only one answer will be correct.

Today's lesson will only cover points 1 to 5. The rest will be covered in the next lessons.

## 2. The tables we need

We need to create the following tables in our database:

1. books
2. categories
3. book_categories (this is a join table to create the many-to-many relationship between books and categories)
4. chapters
5. exerpts
6. questions

You can find the SQL code to create these tables in the file `supabase/20250912232420_books.sql`.

But basically, besides the tables, we need to add some roles to our database.
Do you remember when we created the `authorize` function in the last lesson?
It checks if the user has the role `admin` or `editor`.

Now we will create our first role:

```sql
-- add role_permissions
INSERT INTO public.role_permissions (role, permission)
VALUES
  ('admin', 'editor.manage');
```

If our user is an admin, he can do everything.

Most of our row level security policies will allow the `admin` role to do everything and the other roles to only read.

If in your project you do not want other roles to read, you can remove the `select` permission for them.
Or even limit with other conditions in the policies.

```sql
ALTER TABLE PUBLIC.book_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authorized crud access" ON PUBLIC.book_categories
AS PERMISSIVE FOR ALL
TO authenticated
USING (PUBLIC.authorize('editor.manage'))
WITH CHECK (PUBLIC.authorize('editor.manage'));

CREATE POLICY "Allow read access to everyone" ON PUBLIC.book_categories
AS PERMISSIVE FOR SELECT
TO authenticated, anon
USING (TRUE);
```

Instead of using the `public.authorize` function you might want to use other conditions.
For example if the user can only read the books he created:

```sql
USING
  (auth.uid() = user_id)
WITH CHECK
  (auth.uid() = user_id);
```

But we will cover this in another lesson.

Now that we have the tables and the policies, it is a good idea to generate the types for our database.

```bash
npx supabase gen types typescript --local > ./app/types/database.types.ts
```

I consider you are doing this in the local development environment.

In your `app/lib/supabase.ts` file, you should import the types:

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);
```

When you use the Supabase client, you will have the types available. It helps a lot.

## 3. Building the table component

The table will be used to display the books and categories already created.

I'll be using the table component from shadcn/ui. You can find it [here](https://ui.shadcn.com/docs/components/table).

And also the pagination component from shadcn/ui. You can find it [here](https://ui.shadcn.com/docs/components/pagination).

To install these components, run the following commands:

```bash
pnpm dlx shadcn@latest add table;

pnpm dlx shadcn@latest add pagination;
```

In the file `app/components/internal/table/builder.tsx`, you can find the table component.
It does the following:

- fetches the data from the database using Supabase
- displays the data in a table
- allows to select rows
- allows to delete selected rows
- allows to paginate the data
- redirects to the edit page when clicking on a row
- allows to create a new item
- works in a modal to select items

I did not include the code here because it is quite long. But you can find it in the file mentioned above.
Also it could be improved a lot. But it works for now.

You should be able to use this component in any page by passing the columns and the table name.
Check the file `app/pages/admin/categories/index.tsx` to see how to use it.

It will look like this:

```tsx
<TableBuilder<typeof TABLE_NAME>
  columns={CATEGORIES_COLUMNS}
  tableName={TABLE_NAME}
  settings={TABLE_SETTINGS}
/>
```

I created a new component to use the table in a modal. You can find it in the file `app/components/internal/krafter/fields/modal.tsx`.

## 4. Creating a new register or editing an existing one

To create a new register, we will use the `react-form-krafter` library.
Obs.: I built this library.

You can find the documentation [here](https://react-form-krafter.vercel.app/).

I created 3 pages, they look almost the same. 

There ain't much difference between creating a new register and editing an existing one.

The only change is that when editing, we need to fetch the data from the database and populate the form with the existing data.

And to update the data, we need to use the `update` method instead of the `insert`.

It looks like this:

```tsx
<KrafterRegister>
  <Form<ValidatorBook, SchemaBook>
    formClassName={cn(
      "grid gap-4",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    )}
    fields={BOOK_FIELD}
    schema={schemaBook}
    formApi={formApi}
    onSubmit={async (data) => {
      if (!data.success) return;

      await handleSave(data.state);
    }}
  >
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <Button type="submit">{t("books.submitButton")}</Button>
    </div>
  </Form>
</KrafterRegister>
```
- ValidatorBook: is the type of the form data
- SchemaBook: is the type of the validation schema
- BOOK_FIELD: is an array that contains the fields and their properties
- schemaBook: is the validation schema using zod

Those types and constants are defined in the `utils` page of each folder.

You can find the code for creating a new book in the file `app/pages/admin/books/new.tsx`.

## 5. Creating a view
For simplicity, I created a very simple view to display the books and categories instead of fetching them from two separate queries.

So, if you check the folder `app/pages/admin/booksCategories/`, you will see that there are some minor differences, because we fetch the data from a view instead of a table.

But we insert and update the data in the tables.

If you do not know what a view is, it is basically a saved query that you can treat as a table.

The view we built is:

```sql
CREATE OR REPLACE VIEW public.vw_book_categories with (security_invoker = true) AS
SELECT
  books.title as book_title,
  books.id as book_id,
  categories.id AS category_id,
  categories.name AS category_name,
  book_categories.created_at,
  book_categories.id
FROM
  book_categories
JOIN books ON book_categories.book_id = books.id
JOIN categories ON book_categories.category_id = categories.id;
```