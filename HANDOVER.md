# StorynGo - Handover Front

## Swagger

URL : http://localhost:8080/swagger-ui/index.html

## Auth

Envoyer le token JWT dans le header :

`Authorization: Bearer <token>`

## Lancement backend (JWT_SECRET requis)

### macOS / Linux (bash/zsh)

```bash
export JWT_SECRET="$(openssl rand -base64 48)"
cd /Users/aymanehhhhhh/Desktop/ESGI/bakend
./mvnw spring-boot:run
```

### Windows PowerShell

```powershell
$env:JWT_SECRET = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
cd C:\Users\<votre-user>\Desktop\ESGI\bakend
.\mvnw.cmd spring-boot:run
```

### Windows CMD

```bat
:: Utiliser une valeur longue et aleatoire (exemple)
set JWT_SECRET=replace-with-a-long-random-secret-at-least-32-bytes
cd C:\Users\<votre-user>\Desktop\ESGI\bakend
mvnw.cmd spring-boot:run
```

## Comptes de test

Mot de passe (tous les comptes) : `password`

- Auteur : auteur@storyngo.dev
- Lecteur : lecteur@storyngo.dev

Comptes de vote (utilises pour la categorie Upcoming) :
- voter1@storyngo.dev
- voter2@storyngo.dev

## Donnees de test (IDs utiles)

Stories :
- Story 1 (Fantasy) : id=1
- Story 2 (Horreur) : id=2

Chapitres :
- Chapitre Upcoming : id=4 (story 2, seuil=5, votes=4)

Commentaires :
- Chapitre 1 : au moins 1 commentaire

## Notes

- Profil dev : utiliser `SPRING_PROFILES_ACTIVE=dev` pour charger `data.sql`.
- Les textes envoyes passent par `ModerationService` (blocage du mot "interdit").
