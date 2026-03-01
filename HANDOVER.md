# StorynGo - Handover Front

## Swagger

URL : http://localhost:8080/swagger-ui/index.html

## Auth

Envoyer le token JWT dans le header :

`Authorization: Bearer <token>`

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

