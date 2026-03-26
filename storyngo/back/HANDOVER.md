# StorynGo — Guide de démonstration (Jury)

## Démarrage rapide

```powershell
# 1. Démarrer en mode dev (H2 + données pré-chargées)
$env:SPRING_PROFILES_ACTIVE="dev"
$env:JWT_SECRET=[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
./mvnw.cmd spring-boot:run
```

> **Mode dev** = base H2 in-memory + `data.sql` chargé automatiquement.
> Les données sont recréées à chaque démarrage.

Swagger UI : http://localhost:8080/swagger-ui/index.html

---

## Comptes de démonstration

> **Mot de passe universel : `password`**

| Rôle | Email | Mot de passe | Accès |
|------|-------|-------------|-------|
| **USER** | `jury-user@storyngo.dev` | `password` | Lecture, vote, commentaire, like, favori, follow |
| **REVIEWER** | `jury-reviewer@storyngo.dev` | `password` | + Approuver / Rejeter les histoires en attente |
| **ADMIN** | `jury-admin@storyngo.dev` | `password` | + Gestion utilisateurs, bans, reports, audit logs |

### Se connecter (POST /api/auth/login)

```json
{
  "email": "jury-user@storyngo.dev",
  "password": "password"
}
```

Réponse → copier le `token` et l'utiliser dans Swagger (bouton **Authorize** → `Bearer <token>`).

---

## Scénarios de test

### Scénario 1 — Lecture et vote (compte USER)

1. `GET /api/stories` → voir les histoires publiées
2. `GET /api/stories/1` → détail de *Le Royaume des Brumes* (3 chapitres)
   - Chapitre 1 : débloqué ✅ (5/5 votes)
   - Chapitre 2 : visible, 3/4 votes → **jury-user peut être le 4ème vote !**
   - Chapitre 3 : verrouillé 🔒 (se débloque quand ch.2 atteint son seuil)
3. `POST /api/chapters/2/vote` → voter → le chapitre 3 se débloque automatiquement
4. `POST /api/chapters/1/comments` → commenter un chapitre
5. `POST /api/stories/1/like` → liker une histoire
6. `POST /api/stories/2/bookmark` → ajouter en favori

### Scénario 2 — Modération (compte REVIEWER)

1. `GET /api/reviewer/dashboard` → voir les histoires en attente de revue
2. `GET /api/stories/3` → lire *La Maison du Bout du Monde* (IN_REVIEW)
3. `POST /api/stories/3/approve-review` → publier l'histoire
   — ou —
   `POST /api/stories/3/reject-review` → renvoyer en brouillon

### Scénario 3 — Administration (compte ADMIN)

1. `GET /api/admin/users` → liste de tous les utilisateurs
2. `GET /api/admin/reports/open` → reports prioritisés (3 reports pré-chargés)
3. `PATCH /api/admin/reports/1` → traiter un signalement
4. `POST /api/admin/users/6/ban-temporary` → bannir temporairement
   ```json
   { "duration": "PT1H", "reason": "Comportement inapproprié en démonstration" }
   ```
5. `POST /api/admin/users/6/unban` → débannir
6. `GET /api/admin/audit-logs` → consulter les logs d'audit

### Scénario 4 — Gamification

1. `GET /api/gamification/leaderboard` → classement général XP
2. `GET /api/gamification/leaderboard/weekly` → classement hebdomadaire
3. `GET /api/gamification/xp-history` → historique XP de l'utilisateur connecté

### Scénario 5 — Social

1. `POST /api/social/follow/4` → suivre l'auteur Elara
2. `GET /api/social/feed` → fil d'actualité personnalisé
3. `GET /api/social/following` → liste des abonnements

---

## Données pré-chargées

### Histoires

| ID | Titre | Statut | Auteur | Chapitres |
|----|-------|--------|--------|-----------|
| 1 | Le Royaume des Brumes | PUBLISHED | Elara | 3 (ch.1 ✅, ch.2 à 3/4, ch.3 🔒) |
| 2 | Signal 7 | PUBLISHED | Marcus | 2 (ch.4 ✅, ch.5 à 2/4) |
| 3 | La Maison du Bout du Monde | **IN_REVIEW** | Elara | 1 |
| 4 | Lettres sans Adresse | DRAFT | JuryUser | 1 |

### Chapitres notables

| ID | Histoire | Situation |
|----|----------|-----------|
| 2 | Le Royaume des Brumes | 3/4 votes → **voter pour débloquer le ch.3** |
| 5 | Signal 7 | 2/4 votes → voter pour débloquer |
| 6 | La Maison du Bout du Monde | Chapitre soumis en revue |

### Reports pré-chargés (admin)

| ID | Type | Priorité | Statut |
|----|------|----------|--------|
| 1 | CHAPTER | HIGH | OPEN |
| 2 | USER | MEDIUM | IN_PROGRESS |
| 3 | STORY | LOW | OPEN |

---

## Démarrage en mode PostgreSQL (production)

```powershell
docker compose up -d
$env:DB_URL="jdbc:postgresql://localhost:5432/storyngo"
$env:DB_USERNAME="storyngo"
$env:DB_PASSWORD="storyngo_pwd"
$env:JWT_SECRET=[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
./mvnw.cmd spring-boot:run
```

> En mode PostgreSQL, `data.sql` n'est **pas** chargé (`spring.sql.init.mode=never`).
> Créer les comptes via `POST /api/auth/register` ou basculer en profil `dev`.
