# TODO StorynGo - Stabilisation & Ameliorations

## Correctifs constates (session actuelle)

- [x] Ne plus afficher les stories non publiees sur la home (`DRAFT`, `IN_REVIEW`, `ARCHIVED` exclus)
- [x] Ne plus afficher les stories non publiees dans le feed personnalise
- [x] Corriger le branding home: `Storyn'Go` sans le mot `Platform`
- [x] Afficher photo + pseudo auteur sur les cartes stories
- [x] Activer le signalement des stories (`ReportType.STORY`) + UI de signalement sur la page detail
- [x] Passer le seuil du 1er chapitre de 20 a 5 votes pour faciliter les tests

## Verifications manuelles a faire

- [ ] Home: seulement des stories `PUBLISHED`
- [ ] Feed social: seulement des stories `PUBLISHED` des auteurs suivis
- [ ] Story card: avatar auteur + pseudo visibles sur Home/Trending/Feed
- [ ] Signalement story: creation OK (status `OPEN`) et visible dans dashboard admin
- [ ] Workflow complet: `DRAFT -> IN_REVIEW -> PUBLISHED -> ARCHIVED`
- [ ] Deblocage chapitre avec seuil a 5 votes

## Ameliorations recommandees (prioritaires)

- [ ] Ajouter migrations SQL versionnees (Flyway/Liquibase) pour eviter les ecarts schema/prod
- [ ] Ajouter seeds de test multi-role (admin/reviewer/user) avec comptes et stories pretes
- [ ] Restreindre `getStoryDetails` cote public si besoin (selon statut/role) pour eviter fuite de drafts
- [ ] Ajouter tests integration backend pour:
  - [ ] filtrage `PUBLISHED` (home/feed/trending)
  - [ ] creation report `STORY`
  - [ ] regles workflow stories
- [ ] Ajouter tests frontend smoke:
  - [ ] redirection par role
  - [ ] rendering card auteur (avatar+pseudo)
  - [ ] flow signalement story

## Ameliorations UX utiles

- [ ] Remplacer les `window.prompt` admin par modales controlees (motif, validation, feedback)
- [ ] Ajouter toasts succes/erreur unifies sur actions critiques
- [ ] Ajouter etat "envoi" et confirmation plus visible pour signalement
- [ ] Ajouter fallback avatar (initiales + couleur role)

## Performance & qualite

- [ ] Pagination sur listes admin (users, reports, logs)
- [ ] Limiter/chunker leaderboard et feed
- [ ] Envisager index DB supplementaires sur `stories(status, created_at)`
- [ ] Documenter conventions API/DTO (noms, erreurs, statuts)

## Securite

- [ ] Verifier politique CORS pour preprod/prod
- [ ] Verifier rotation et gestion securisee du `JWT_SECRET`
- [ ] Ajouter rate limiting sur auth/report/vote/comment
