create or replace function public.set_book_focus(
  p_book_id uuid,
  p_chapter_number int default null,
  p_excerpt_id uuid default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing record;
  v_chapter_id uuid;
  v_excerpt_id uuid;
begin
  -- check if there's already a focus for this user/book
  select * into v_existing
  from book_focus
  where user_id = v_user_id and book_id = p_book_id;

  if found and p_chapter_number is null and p_excerpt_id is null then
   -- nothing to update
   return;
  end if;

  if found then
    v_excerpt_id := coalesce(p_excerpt_id, v_existing.excerpt_id);
  end if;
  
  -- find first chapter/excerpt if not provided
  if p_chapter_number is null then
      select id into v_chapter_id
      from chapters
      where book_id = p_book_id
      and status = 'done'
      order by number asc, created_at asc
      limit 1;
  else
      select id into v_chapter_id
      from chapters
      where book_id = p_book_id
      and number = p_chapter_number;
  end if;

  if p_excerpt_id is null then
      select id into v_excerpt_id
      from excerpts
      where chapter_id = v_chapter_id
      order by order_index asc, created_at asc
      limit 1;
  else
      v_excerpt_id := p_excerpt_id;
  end if;

  insert into book_focus (user_id, book_id, chapter_id, excerpt_id, updated_at)
  values (v_user_id, p_book_id, v_chapter_id, v_excerpt_id, now())
  on conflict (user_id, book_id)
  do update set
    chapter_id = excluded.chapter_id,
    excerpt_id = excluded.excerpt_id,
    updated_at = now();
end;
$$;