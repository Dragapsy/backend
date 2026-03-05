# StorynGo - Roadmap de Finalisation (A-Z)

Ce document centralise le plan de finalisation du projet avant hebergement.

## Sprint 1 - Backend: solidifier l'API [TERMINE]

### Realise
- Validation DTO stricte sur:
  - `Backend/src/main/java/com/storyngo/dto/RegisterRequest.java`
  - `Backend/src/main/java/com/storyngo/dto/LoginRequest.java`
  - `Backend/src/main/java/com/storyngo/dto/StoryCreateRequest.java`
  - `Backend/src/main/java/com/storyngo/dto/ChapterCreateRequest.java`
  - `Backend/src/main/java/com/storyngo/dto/CommentCreateRequest.java`
- Activation de `@Valid` et statuts `201` sur creations dans:
  - `Backend/src/main/java/com/storyngo/controllers/AuthController.java`
  - `Backend/src/main/java/com/storyngo/controllers/StoryController.java`
- Mapping metier/HTTP propre via exceptions dediees:
  - `ConflictException`, `ResourceNotFoundException`, `UnauthorizedException`, `ForbiddenOperationException`
  - `Backend/src/main/java/com/storyngo/exceptions/GlobalExceptionHandler.java`
- Harmonisation moderation/services:
  - `Backend/src/main/java/com/storyngo/services/StoryService.java`
  - `Backend/src/main/java/com/storyngo/services/CommentService.java`
  - `Backend/src/main/java/com/storyngo/services/AuthService.java`
- Securite ajustee:
  - Swagger/H2 en `permitAll`
  - suppression de `web.ignoring`
  - distinction `401` (non authentifie) vs `403` (interdit)
  - secret JWT sans fallback implicite

## Sprint 2 - Backend: couverture de tests [TERMINE]

### Realise
- Tests services (unitaires + integration) ajoutes/corriges:
  - `Backend/src/test/java/com/storyngo/services/AuthServiceTests.java`
  - `Backend/src/test/java/com/storyngo/services/StoryServiceTests.java`
  - `Backend/src/test/java/com/storyngo/services/CommentServiceTests.java`
  - `Backend/src/test/java/com/storyngo/services/StoryServiceIntegrationTests.java`
- Tests API MockMvc ajoutes/corriges:
  - `Backend/src/test/java/com/storyngo/controllers/AuthControllerTests.java`
  - `Backend/src/test/java/com/storyngo/controllers/StoryControllerTests.java`
- Dependance test ajoutee:
  - `Backend/pom.xml` (`spring-security-test`)

### Validation test (Surefire)
- `com.storyngo.controllers.AuthControllerTests`: `4/4` pass
- `com.storyngo.controllers.StoryControllerTests`: `6/6` pass
- `com.storyngo.services.StoryServiceIntegrationTests`: `3/3` pass

## Sprint 3 - Frontend: brancher 100% back reel

### Contexte auth
- UserContext.tsx:
  - enlever le mock bootstrap par defaut.
  - gerer le vrai flow token (set/clear/401/expiration).

### API Front
- storyApi.ts: conserver l'existant et ajouter:
  - `register(...)`
  - `login(...)`
  - `createStory(...)`
  - `addChapter(...)`
  - `getComments(...)`
  - `addComment(...)`

### Types TS
- index.ts: verifier/completer:
  - `LoginRequest`
  - `RegisterRequest`
  - `StoryCreateRequest`
  - `ChapterCreateRequest`
  - `CommentCreateRequest`
  - `ErrorResponse`

### Pages
- `Frontend/src/pages/LoginPage.tsx` (nouveau): formulaire login + affichage erreurs backend.
- `Frontend/src/pages/RegisterPage.tsx` (nouveau): formulaire register + validations + erreurs backend.
- `CreateStoryPage.tsx`: brancher sur `POST /api/stories`.
- `StoryDetailPage.tsx`:
  - commentaires: liste `GET /api/chapters/{id}/comments`.
  - commentaires: ajout `POST /api/chapters/{id}/comments`.
  - formulaire d'ajout chapitre selon contexte auteur.
- `App.tsx`: routes auth + guards simples sur pages/actions protegees.
- `apiClient.ts`: intercepteur reponse pour capturer `401` et declencher logout/navigation.

## Sprint 4 - UX et finition

### Composants d'etat
- creer des composants reutilisables:
  - `LoadingState`
  - `ErrorBanner`
  - `EmptyState`

### Pages et style
- HomePage.tsx: gerer les etats vide/erreur section par section.
- index.css: finaliser responsive mobile/tablette/desktop.
- pages: uniformiser feedbacks succes/erreur apres actions.

## Sprint 5 - Pre-prod locale

### Environnement
- `Frontend/.env.example`:
  - `VITE_API_BASE_URL=http://localhost:8080/api`

### Documentation
- backend README: runbook local back + front.
- frontend README: scripts, variables, auth flow, structure.

### Recette manuelle finale
- Register -> Login -> Dashboard -> Detail -> Vote -> Comment.
- CreateStory -> AddChapter (seuil respecte).
- verifier cas d'erreurs metier visibles et comprehensibles.

## Definition of Done globale
- Fonctionnalites metier completes cote front et back.
- API validee par tests.
- UI propre, responsive, et messages d'erreur lisibles.
- Environnement local reproductible pour toute l'equipe.
