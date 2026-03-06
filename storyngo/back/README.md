# StorynGo Backend

Backend Spring Boot pour StorynGo.

## Base URL

- API locale: `http://localhost:8080/api`

## Demarrer

- Lancer l'application :

```powershell
& "C:\Users\Aymane\Desktop\DEV\Projet annuelle\backend\mvnw.cmd" spring-boot:run
```

- Lancer les tests :

```powershell
& "C:\Users\Aymane\Desktop\DEV\Projet annuelle\backend\mvnw.cmd" test
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
