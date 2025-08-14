# Welcome to React Form Krafter!

A modern, production-ready template for building full-stack React applications using React Form Krafter.

This template was based on the [React Router default template](https://github.com/remix-run/react-router-templates/tree/main/default).

## Features

- 📝 **Flexible, type-safe forms** powered by React Form Krafter
- 🚀 **Server-side rendering** for fast, SEO-friendly pages
- ⚡️ **Hot Module Replacement (HMR)** for instant feedback during development
- 📦 **Asset bundling and optimization** for efficient production builds
- 🔄 **Data loading and mutations** with React Router
- 🔒 **TypeScript by default** for robust type safety
- 🎉 **TailwindCSS & Shadcn UI** for modern, accessible styling
- 🧭 **Client-side routing** with React Router
- 📖 [React Form Krafter docs](https://react-form-krafter.vercel.app/) for more info

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

## About This Template

This is the **Basic Template** for React Form Krafter, designed to help you quickly start building forms in React with type safety, modern UI, and routing. It combines:

- **React Form Krafter** for flexible, type-safe form creation and validation
- **Shadcn UI** for beautiful, accessible React components
- **React Router** for client-side navigation
- **TypeScript** for robust type checking

This template is ideal for projects that need a simple, extensible form setup with best practices out of the box.

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.
