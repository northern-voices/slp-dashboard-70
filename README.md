# Welcome to the SLP/SSS Project

To run this code, have Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- TanStack Query

## Deploying Supabase Edge Functions

Edge function source lives under `supabase/`, organized by feature (e.g. `supabase/monthly-meetings/`, `supabase/_shared/`). Each deployable function has a
matching entry at `supabase/functions/<name>/index.ts` — a symlink back to its real source file — which is what the Supabase CLI looks for when deploying.

After making changes, deploy a single function from the repo root:

```sh
supabase functions deploy <function-name> --project-ref tvdnhcocgvuzeonejiut
```
