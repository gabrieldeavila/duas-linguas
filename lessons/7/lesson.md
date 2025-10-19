# Lesson 7: Deploying to production 

In this lesson, we will deploy our application to production.

## 1. Creating a new Supabase project
First, go to the [Supabase dashboard](https://supabase.com/dashboard) and create a new project.

### 1.1. Project settings
Little after creating the project, Supabase will generate a database password for you. Make sure to save it somewhere safe, as you will need it later.

After creating the project, go to the project settings and we will need to grab some information. Go to the "Project Settings" section.

Grab your `Project ID`.
Go to the `Data API` section and grab your `API URL`.

Access the `API Keys` section, there you will find two tabs, "Legacy" and "API keys". 
We will use the "API keys".

There you need to get the `Publishable Key` (this key is public and can be used in the frontend).
And it is necessary to create a new `Service Key` (this key is private and should only be used in the backend).

I am deploying my frontend to production using Railway, if you don't know about Railway, you can check it out [here](https://railway.com?referralCode=OzMLUU).

If you follow this template, the only thing you need to do is add the environment variables to Railway.

### 1.2. Environment variables
On Railway, go to your project, then to the "Settings" tab and then to the "Environment" section.
Add the following environment variables:
- `VITE_SUPABASE_URL`: your Supabase API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your Supabase Publishable Key

## 2. Deploying the database
To deploy the database, we will use the GitHub workflow provided by Supabase.

Before this, we need to create a new access token for the GitHub workflow.
Go to your Supabase account settings and create a new access token with the `Service Role` role. Go to [this page](https://supabase.com/dashboard/account/tokens)

On your GitHub repository, go to the "Settings" tab, then to the "Secrets and variables" section and then to the "Actions" section.

Then, we need to add these new secrets:
- `SUPABASE_ACCESS_TOKEN`: the access token you just created
- `SUPABASE_PROJECT_ID`: your Supabase Project ID
- `PRODUCTION_DB_PASSWORD`: your Supabase Database password

Remember, never share your database password or service role key publicly.

The workflow I`ll be using is the [supabase.migrations.deploy.yml](https://github.com/gabrieldeavila/duas-linguas/blob/main/.github/workflows/supabase.migrations.deploy.yml) provided by Supabase.

Basically, this workflow will run the migrations on your production database every time you push to the `main` branch.

I recommend creating branches for your features and then merging them into the `main` branch when they are ready.

## 3. Deploying the functions
To deploy the functions, we will also use a GitHub workflow provided by Supabase.

The workflow I`ll be using is the [supabase.functions.deploy.yml](https://github.com/gabrieldeavila/duas-linguas/blob/main/.github/workflows/supabase.functions.deploy.yml) provided by Supabase.

I only did a small change to the workflow. For the functions that are triggered by HTTP requests, I added the `--no-verify-jwt` flag to the `supabase functions deploy` command. So, the functions that are triggered by HTTP requests can be accessed publicly without a JWT.

## 4. Adding vault keys
Remember that in lesson 6 we created some vault keys to encrypt and decrypt data.

We need to add these keys to the Supabase project.

Go to the "Sql Editor" section and run the following commands to add the vault keys:

```sql
select vault.create_secret(
  'API_URL',
  'supabase_url'
);

select vault.create_secret(
  'A_REALLY_LONG_KEY_YOU_SHOULD_NOT_SHARE',
  'internal_secret_key'
);

select vault.create_secret(
  'PUBLISHABLE_KEY',
  'anon_key'
);
```

Remember to replace the values with your own.

## 5. Adding the custom_access_token_hook
Finally, we need to enable the `custom_access_token_hook` function we created in lesson 4.

Go to the `Authentication > Auth Hooks (Beta)` and add the `custom_access_token_hook` hook.

That's it! Your application is now deployed to production.