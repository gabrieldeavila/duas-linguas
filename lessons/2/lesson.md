# Lesson 2
On this lesson, we will learn how to authenticate users with Supabase.

You can also follow this [link](https://supabase.com/docs/guides/auth/passwords?queryGroups=language&language=js#with-email).

## signUpNewUser
Go to the file `lib/app/pages/signin/index.tsx` and let's implement the `signUpNewUser` function.

The function we will add is:

```tsx
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })
}
```

This will happen when the user submits the sign-up form.

## signInWithEmail
Go to the file `lib/app/pages/signin/index.tsx` and let's implement the `signInWithEmail` function.

The function we will add is:

```tsx
async function signInWithEmail() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })
}
```

This will happen when the user submits the sign-in form.
