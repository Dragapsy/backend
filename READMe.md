# Mise en place du projet sur votre ordinateur

## 1- Les pré-requis pour faire fonctionner le site

Technologie :
- NodeJS (v24.11.0) & NPM (v11.6.1)
- Git (git version 2.51.2.windows.1)
- Java (java 21.0.10)

Application :
- VSCode ou IntelliJ IDEA (avec un terminal fonctionnel - Powershell)
- Docker Desktop


## 2- Mise en place du Back

Avant de lancer le backend du site internet, rendez-vous dans `./backend/storyngo/back`, ajoutez dans ce dossier un fichier `.env` et dedans mettez le code ci-dessous.

```bash
POSTGRES_DB=storyngo
POSTGRES_USER=storyngo
POSTGRES_PASSWORD=storyngo_pwd

DB_URL=jdbc:postgresql://localhost:5432/storyngo
DB_USERNAME=storyngo
DB_PASSWORD=storyngo_pwd

JWT_SECRET=change-this-with-a-long-random-secret-key

```

Ensuite lancer la commande suivant dans le même dossier `docker compose up`, afin de faire l'installation complète du back et de la base de donnée. 
Une fois ceci réalisé, ouvrez un nouveau terminal et allez toujours dans le même dossier. Mettez cette commande `$env:JWT_SECRET="change-this-with-a-long-random-secret-key"` afin de générer votre clé secrète JWT Token et tapez pour finir cette commande : `mvn spring-boot:run` qui permettra de lancer le backend


## 3- Mise en place du Front

Ouvrez un nouveau terminal et allez dans le dossier suivant: `./backend/storyngo/front`, tapez `npm i` ou `npm install`, afin d'installer toutes les dépendances du front.
Une fois ceci effectuer, lancez le front avec la commande `npm run dev` et vous aurez un lien pour accéder au site internet.