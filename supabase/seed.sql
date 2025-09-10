/**
 * HELPER FUNCTIONS
 * Create test user helper method.
 */
create or replace function public.create_user(
    email text
) returns uuid
    security definer
    set search_path = auth
as $$
  declare
  user_id uuid;
begin
  user_id := extensions.uuid_generate_v4();
  
  insert into auth.users (id, email)
    values (user_id, email)
    returning id into user_id;

    return user_id;
end;
$$ language plpgsql;