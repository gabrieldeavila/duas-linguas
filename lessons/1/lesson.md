# Lesson 1
Welcome to the first lesson of Duli! In this lesson, we will set up the project and understand its structure.

## Setting Up
First, make sure you have cloned the repository and installed the dependencies:

```bash
git clone https://github.com/gabrieldeavila/duas-linguas.git
cd duas-linguas
pnpm install
```

If you don't have Node.js installed, you can download it from the [official website](https://nodejs.org/).

### Docker
We will be using Docker to run Supabase locally. If you don't have Docker installed, you can download it from the [official website](https://www.docker.com/products/docker-desktop) - it's free and easy to set up.

If you don't want to use Docker, you can sign up for a free account at [supabase.com](https://supabase.com/) and use their hosted service.

#### Supabase
Supabase is a backend-as-a-service platform that provides a Postgres database, authentication, and real-time subscriptions. It is an open-source alternative to Firebase. 

It really simplifies the process of building and scaling applications.

If you will not be using Supabase locally, you can skip this section.

First, you need to install supabase CLI:

```bash
npm install -g supabase
```
I recommend creating a new folder, so you can keep your Supabase project separate from your application code.

Now you can init:

```bash
supabase init
```

A new folder will be created with the necessary files.

On the config.toml file, you can configure your database connection and other settings.

I recommend only changing the project_id name.

You can also configure the API keys and other settings. We will cover this later.

Now, we can start the Supabase local development setup by running:

```bash
supabase start
```

This might take some time to download the necessary Docker images and start the containers.
So, do not close the terminal or stop the process.

After the containers are running, you can access the Supabase dashboard at http://localhost:54323 or http://127.0.0.1:54323.

A reminder you can change this port in the config.toml file.

```toml
[studio]
enabled = true
port = 55433
api_url = "http://127.0.0.1"
```

## Duli Structure
As of today there is no backend code in this project.

Most of the code will be done on the "app" folder.

### api
Contains routes used by the server side code.
As of today, there is only the "locales" route, used to return translations.

### locales
The "locales" folder contains the translation files for each language. Each file is a JSON object with key-value pairs, where the key is the translation key and the value is the translated string.

Currently there is only translations for pt and en.

### middleware
This folder contains only the i18next.ts file used to initialize the i18next instance and configure the language detection and backend plugins. 

It's used on the root file.

### pages
The most used folder contains the React components for each page of the application. Each file is a React component that exports a default function.
 
### styles
Contains the global styles for the application. We are using Tailwind CSS for styling.

### root.tsx
The root file contains the main layout and the error boundary.

### routes.ts
Contains the route definitions for the application.

### entry.client.tsx
Initializes the i18n and zod errors translation.

### entry.server.tsx
Used to return responses from the server.
