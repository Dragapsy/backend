# StorynGo — Backend API

Plateforme communautaire d'écriture collaborative épisodique.

> **API REST** · Java 21 · Spring Boot 3.4 · PostgreSQL 16 · JWT

---

## Prérequis

- Java 21+
- Docker Desktop (pour PostgreSQL)
- Maven (ou utiliser le wrapper `./mvnw.cmd` inclus)

---

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd storyngo/back
```

### 2. Configurer les variables d'environnement

Copier le fichier d'exemple :

```powershell
Copy-Item .env.postgres.example .env
```

Éditer `.env` et définir un `JWT_SECRET` fort (32 caractères minimum) :

```env
JWT_SECRET=votre-secret-long-et-aleatoire-ici
DB_URL=jdbc:postgresql://localhost:5432/storyngo
DB_USERNAME=storyngo
DB_PASSWORD=storyngo_pwd
```

### 3. Démarrer la base de données (PostgreSQL via Docker)

```bash
docker compose up -d
```

Vérifier que le container est `healthy` :

```bash
docker compose ps
```

### 4. Lancer le backend

**PowerShell :**
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/storyngo"
$env:DB_USERNAME="storyngo"
$env:DB_PASSWORD="storyngo_pwd"
$env:JWT_SECRET=[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
./mvnw.cmd spring-boot:run
```

**Bash / WSL :**
```bash
DB_URL=jdbc:postgresql://localhost:5432/storyngo \
DB_USERNAME=storyngo \
DB_PASSWORD=storyngo_pwd \
JWT_SECRET=votre-secret-long-et-aleatoire \
./mvnw spring-boot:run
```

L'API est disponible sur : `http://localhost:8080/api`

---

## Lancer les tests

```bash
./mvnw.cmd test
```

Les tests utilisent une base H2 in-memory (pas besoin de Docker).

---

## Documentation API (Swagger)

Une fois le backend démarré :

- **Swagger UI** : http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON** : http://localhost:8080/v3/api-docs

---

## Profils de configuration

| Profil | Base de données | Usage |
|--------|----------------|-------|
| (défaut) | PostgreSQL | Production / développement standard |
| `dev` | H2 in-memory | Tests rapides sans Docker |
| `test` | H2 in-memory | Suite de tests automatisés |

**Activer le profil dev :**
```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
$env:JWT_SECRET=[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
./mvnw.cmd spring-boot:run
```

---

## Structure du projet

```
src/
├── main/java/com/storyngo/
│   ├── controllers/       # Endpoints REST (3 controllers)
│   ├── services/          # Logique métier (10 services)
│   ├── repositories/      # Accès base de données (13 repositories JPA)
│   ├── models/            # Entités JPA + enums
│   ├── dto/               # Objets de transfert (35+ DTOs)
│   ├── mappers/           # Conversion entités ↔ DTOs (MapStruct)
│   ├── security/          # JWT Filter + Spring Security config
│   └── exceptions/        # Exceptions personnalisées + handler global
└── main/resources/
    ├── application.properties          # Config principale (PostgreSQL)
    ├── application-dev.properties      # Config H2 (profil dev)
    └── application-test.properties     # Config tests
```

---

## Endpoints principaux

| Domaine | Endpoints |
|---------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Stories | `GET /api/stories`, `POST /api/stories`, `GET /api/stories/{id}` |
| Chapitres | `POST /api/stories/{id}/chapters`, `POST /api/chapters/{id}/vote` |
| Workflow | `POST /api/stories/{id}/submit-review`, `/approve-review`, `/reject-review` |
| Admin | `GET /api/admin/users`, `POST /api/admin/users/{id}/ban-*` |
| Social | `POST /api/social/follow/{id}`, `GET /api/social/feed` |
| Gamification | `GET /api/gamification/leaderboard` |

Voir la [documentation complète (Swagger)](http://localhost:8080/swagger-ui/index.html) pour tous les endpoints.

---

## Arrêter les services

```bash
# Arrêter PostgreSQL
docker compose down

# Arrêter PostgreSQL ET supprimer les données (reset complet)
docker compose down -v
```

---

## Comptes de test

Voir `HANDOVER.md` pour les identifiants de test et les IDs utiles.
