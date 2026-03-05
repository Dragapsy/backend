# StorynGo Frontend

Frontend web de StorynGo, construit avec React + TypeScript + Vite.

## Stack technique

- React 19
- TypeScript
- Vite 7
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icones)

## Prerequis

- Node.js 20+ (LTS recommande)
- npm 10+
- Backend StorynGo disponible en local (ou URL distante)

## Installation

```bash
cd Frontend
npm install
```

## Configuration environnement

1. Copier le fichier d'exemple:

```bash
cp .env.example .env
```

2. Variables importantes:

- `VITE_API_BASE_URL`: URL de l'API backend (ex: `http://localhost:8080/api`)
- `VITE_MOCK_USER_EMAIL`: email utilisateur mock (temporaire)
- `VITE_MOCK_USER_PASSWORD`: mot de passe utilisateur mock (temporaire)

## Lancer le projet

```bash
npm run dev
```

Application disponible par defaut sur `http://localhost:5173`.

## Scripts utiles

- `npm run dev`: lance le serveur de developpement
- `npm run build`: build de production (TypeScript + Vite)
- `npm run preview`: previsualiser le build produit
- `npm run lint`: verifier le lint

## Structure du projet

```text
src/
  api/          # axios client + appels API
  components/   # composants reutilisables UI
  context/      # contexte utilisateur/session
  pages/        # pages (Dashboard, StoryDetail, Auth, etc.)
  types/        # types TypeScript alignes backend DTO
```

## Fonctionnalites actuellement branchees

- Dashboard (Derniers Drops / Trending / Upcoming)
- Detail d'une story
- Vote sur chapitre
- Base de Create Story (selon avancement)

## Convention API

- Toutes les requetes passent par `src/api/apiClient.ts`.
- Le token JWT est envoye en header `Authorization: Bearer <token>` quand present.
- Les erreurs backend sont attendues au format:

```json
{ "error": "message" }
```

## Checklist reprise pour un nouveau dev

1. Installer Node.js et npm (versions ci-dessus).
2. Lancer le backend StorynGo sur `:8080`.
3. Configurer `.env` a partir de `.env.example`.
4. Installer les deps `npm install`.
5. Lancer `npm run dev`.
6. Verifier le parcours principal sur le dashboard.

## Troubleshooting rapide

- Erreurs API dans l'UI:
  - verifier que le backend tourne
  - verifier `VITE_API_BASE_URL`
- Erreurs CORS:
  - verifier la config `app.cors.allowed-origin-patterns` cote backend
- 401 sur actions protegees:
  - verifier presence/validite du token JWT

