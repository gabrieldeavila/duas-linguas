/**
 * HELPER FUNCTIONS
 * Create test user helper method.
 */

-- Insert admin user identity
INSERT INTO auth.users ( instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'admin@gmail.com', crypt('password', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp, '', '', '', '');

-- test user email identity
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), (SELECT id FROM auth.users WHERE email = 'admin@gmail.com'), format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'admin@gmail.com')::text, 'admin@gmail.com')::jsonb, 'email', uuid_generate_v4(), current_timestamp, current_timestamp, current_timestamp);

-- add role
insert into public.user_roles(user_id, role) values
((select id from auth.users where email = 'admin@gmail.com'), 'admin');

select vault.create_secret(
  'http://host.docker.internal:55431', 
  'supabase_url'
);