# FamilySuite

Een gedeelde familie-app met todo/taakbeheer, recepten, boodschappenlijst en kanban boards. Meerdere gebruikers per workspace.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Netlify
- **State:** Zustand + React Context
- **DnD:** @dnd-kit

## Setup

### 1. Clone de repo

```bash
git clone https://github.com/LHegt-colab/familysuite.git
cd familysuite
```

### 2. Installeer dependencies

```bash
npm install
```

### 3. Configureer environment variabelen

```bash
cp .env.example .env.local
```

Vul in `.env.local`:
```
VITE_SUPABASE_URL=https://tvrvzxizradybqnfsqpn.supabase.co
VITE_SUPABASE_ANON_KEY=<jouw-anon-key>
```

### 4. Start lokaal

```bash
npm run dev
```

## Supabase Setup

1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard/project/tvrvzxizradybqnfsqpn)
2. SQL Editor → voer de migraties uit in `supabase/migrations/`
3. Authentication → Email confirmations instellen

## Netlify Deploy

1. Koppel GitHub repo aan Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Voeg environment variabelen toe in Netlify dashboard
