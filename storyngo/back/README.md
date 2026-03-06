# StorynGo Backend

Backend Spring Boot pour StorynGo.

## Base URL

- API locale: `http://localhost:8080/api`

## Base de donnees locale (PostgreSQL)

Le projet supporte 2 modes:
- mode principal (par defaut): PostgreSQL (base reelle)
- mode secondaire (optionnel): H2 en memoire avec le profil `dev`

### 1) Preparer l'environnement (une seule fois)

Depuis `storyngo/back`, copier le fichier d'exemple:

```powershell
Copy-Item .env.postgres.example .env
```

Puis editer `.env` et mettre une vraie valeur pour `JWT_SECRET`.

### 2) Demarrer PostgreSQL avec Docker

Toujours dans `storyngo/back`:

```powershell
docker compose up -d
```

Verifier que le container est bien en `healthy`:

```powershell
docker compose ps
```

### 3) Lancer le backend (PostgreSQL par defaut)

PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/storyngo"
$env:DB_USERNAME="storyngo"
$env:DB_PASSWORD="storyngo_pwd"
$env:JWT_SECRET="votre-secret-long-et-aleatoire"
./mvnw.cmd spring-boot:run
```

Alternative en une ligne:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/storyngo"; $env:DB_USERNAME="storyngo"; $env:DB_PASSWORD="storyngo_pwd"; $env:JWT_SECRET="votre-secret-long-et-aleatoire"; ./mvnw.cmd spring-boot:run
```

### 3 bis) Optionnel: lancer en H2 (profil `dev`)

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
$env:JWT_SECRET="votre-secret-long-et-aleatoire"
./mvnw.cmd spring-boot:run
```

### 4) Arreter PostgreSQL

```powershell
docker compose down
```

Pour supprimer aussi les donnees (reset complet):

```powershell
docker compose down -v
```

### Notes importantes

- PostgreSQL est maintenant la configuration par defaut de l'application.
- Le seed `data.sql` n'est pas injecte en mode PostgreSQL (`spring.sql.init.mode=never`) pour proteger tes vraies donnees.
- Le profil `dev` reste disponible pour des essais rapides en H2.
- Les tests continuent d'utiliser H2 via `application-test.properties`.

## Demarrer

- Lancer l'application :

```powershell
./mvnw.cmd spring-boot:run
```

- Lancer les tests :

```powershell
./mvnw.cmd test
```

## Swagger

Swagger UI : `http://localhost:8080/swagger-ui/index.html`

## Documentation API (resume)

### Auth
- `POST /api/auth/register` : inscription, renvoie `AuthResponse`
- `POST /api/auth/login` : connexion, renvoie `AuthResponse`

### Stories (lecture)
- `GET /api/stories` : liste stories
- `GET /api/stories/trending` : stories tendance
- `GET /api/stories/{id}` : detail story + chapitres
- `GET /api/stories/{id}/quality-score` : score metier detaille

### Stories (workflow metier)
- `POST /api/stories` : creation story + chapitre 1
- `POST /api/stories/{id}/chapters` : ajout chapitre (auteur, `DRAFT`)
- `PATCH /api/chapters/{id}` : edition chapitre (auteur, `DRAFT`)
- `POST /api/stories/{id}/submit-review` : `DRAFT -> IN_REVIEW`
- `POST /api/stories/{id}/approve-review` : `IN_REVIEW -> PUBLISHED` (reviewer/admin)
- `POST /api/stories/{id}/reject-review` : `IN_REVIEW -> DRAFT` (reviewer/admin)
- `POST /api/stories/{id}/archive` : `PUBLISHED -> ARCHIVED` (auteur/admin)

### Versions et engagement
- `GET /api/chapters/{id}/versions` : historique versions
- `POST /api/chapters/{id}/versions/{versionId}/restore` : restauration version (auteur, `DRAFT`)
- `POST /api/chapters/{id}/vote` : vote chapitre
- `GET /api/chapters/{id}/comments` : commentaires
- `POST /api/chapters/{id}/comments` : ajout commentaire

## DTO principaux

- Requetes: `RegisterRequest`, `LoginRequest`, `StoryCreateRequest`, `ChapterCreateRequest`, `ChapterUpdateRequest`, `CommentCreateRequest`
- Reponses: `AuthResponse`, `StoryDTO`, `StoryDetailsDTO`, `ChapterDTO`, `ChapterVersionDTO`, `StoryQualityScoreDTO`, `CommentDTO`, `VoteResultDTO`, `ErrorResponse`

## Workflow metier

- Etats story: `DRAFT -> IN_REVIEW -> PUBLISHED -> ARCHIVED`
- Contraintes fortes:
	- edition/ajout/restauration de chapitre seulement en `DRAFT`
	- review reservee aux `REVIEWER`/`ADMIN`
	- archivage a partir de `PUBLISHED`
	- controle d'integrite sur l'ordre des chapitres

## Handover

Voir `HANDOVER.md` pour les comptes de test et les IDs utiles.
