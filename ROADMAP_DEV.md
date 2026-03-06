# StorynGo - Roadmap WOW (14 jours) 

Objectif: passer d'un bon projet "fonctionnel" a un projet "niveau Bac+5" sur 2 axes uniquement:
- Metier (regles fortes, workflow reel, logique decisionnelle visible)
- Front visuel (identite, polish, clarté UX, rendu portfolio)

---

## 1) Ce qui est deja solide (on garde)

- API backend propre, validation DTO et gestion des erreurs deja en place.
- Base de tests existante (services + controllers) deja demarree.
- Front structurellement propre (pages, composants, API layer).

Conclusion: la base est bonne. Le gap "Bac+5" est dans la profondeur metier + impact visuel.

---

## 2) Cible finale "WOW" a J+14

### Cible metier
- Workflow d'histoire strict: `DRAFT -> IN_REVIEW -> PUBLISHED -> ARCHIVED`
- Permissions contextuelles:
  - Auteur: creer/editer brouillon, soumettre en review
  - Reviewer: valider/refuser en review
  - Reader: lecture + commentaires si publie
  - Admin: supervision globale
- Versionning chapitre: historique + restauration d'une version
- Controle de coherence: ordre des chapitres, transitions de statuts interdites, actions bloquantes selon contexte
- Score metier visible (quality score): completude + regularite + engagement de base

### Cible visuelle
- Une page "Story Detail" signature, premium et lisible
- Design system coherent (espacements, typo, boutons, cards, formulaires, etats)
- Etats UX tres propres (skeleton, erreur actionnable, empty state guide)
- Responsive reel mobile/tablette/desktop
- Micro-interactions utiles (feedback de sauvegarde/publication)

---

## 3) Plan d'execution detaille (14 jours)

## Semaine 1 - Metier fort

### Jour 1 - Modeler le workflow
Livrables:
- Enum des statuts d'histoire + regles de transition centralisees
- Table/migration (si necessaire) pour persister le statut
- DTO/response mis a jour

Done quand:
- Une transition invalide renvoie une erreur metier explicite

### Jour 2 - Permissions contextuelles
Livrables:
- Matrice de permissions (action x role x statut)
- Garde metier centralisee cote service
- Codes d'erreurs cohérents (401/403/409)

Done quand:
- Chaque endpoint sensible applique la matrice, pas de contournement possible

### Jour 3 - Endpoints de workflow
Livrables:
- Actions metier exposees:
  - soumettre en review
  - approuver/rejeter
  - archiver
- Tests unitaires sur transitions

Done quand:
- Le cycle complet d'une histoire est testable en API

### Jour 4 - Versionning chapitre
Livrables:
- Snapshot/version de chapitre a chaque edition
- Endpoint de listing des versions
- Endpoint de restauration

Done quand:
- Une restauration remet exactement un contenu precedent

### Jour 5 - Regles de coherence
Livrables:
- Validation ordre des chapitres
- Interdiction d'ajouter/modifier selon statut
- Messages d'erreur metier comprehensibles

Done quand:
- Les 5 cas limites principaux sont couverts par tests

### Jour 6 - Score metier
Livrables:
- Formule simple et explicite du score (0-100)
- Endpoint pour recuperer score + detail des composantes

Done quand:
- Le score evolue de maniere previsible selon actions utilisateur

### Jour 7 - Consolidation metier
Livrables:
- Refacto mineure pour lisibilite services
- Tests integration sur parcours complet
- Documentation rapide des regles (tableau)

Done quand:
- Parcours metier principal passe de bout en bout sans incoherence

## Semaine 2 - Visuel premium

### Jour 8 - Direction UI
Livrables:
- Tokens unifies (espacement/tailles/etats)
- Regles de hiérarchie visuelle (titres, sections, CTA)

Done quand:
- Les composants majeurs partagent le meme langage visuel

### Jour 9 - Page Story Detail signature
Livrables:
- Hero clair (titre, statut, auteur, score)
- Sections: chapitres, timeline workflow, commentaires
- CTA contextuels selon role/statut

Done quand:
- La page est compréhensible en moins de 5 secondes

### Jour 10 - Etats UX
Livrables:
- Skeleton propre pour chargement
- Empty states guidants (avec action)
- Erreurs actionnables avec next step

Done quand:
- Aucun ecran vide brut ou erreur brute JSON

### Jour 11 - Formulaires premium
Livrables:
- Champs coherents (label/help/error)
- Validation inline utile, non agressive
- Feedback succes/erreur apres actions

Done quand:
- Parcours create/edit/publish sans friction visuelle

### Jour 12 - Responsive reel
Livrables:
- Grille et densite adaptees mobile/tablette/desktop
- CTA critiques accessibles au pouce sur mobile

Done quand:
- Aucun debordement, aucune section casse sur 3 breakpoints cibles

### Jour 13 - Polish final
Livrables:
- Micro-interactions courtes et utiles
- Harmonie spacing/alignement globale
- Uniformisation des messages utilisateur

Done quand:
- Perception "produit fini" au premier coup d'oeil

### Jour 14 - Demo-ready
Livrables:
- Script demo 7 minutes
- Captures/screens de portfolio
- README metier + README front visuel mis a jour

Done quand:
- Tu peux presenter le produit sans justifier des zones faibles

---

## 4) Backlog priorise (si temps limite)

Priorite P1 (obligatoire WOW):
- Workflow + permissions + coherence metier
- Page Story Detail signature
- Etats UX et responsive propre

Priorite P2 (fortement recommande):
- Versionning chapitre
- Score metier
- Micro-interactions

Priorite P3 (bonus):
- Dashboard analytique plus pousse
- Mode comparaison de versions

---

## 5) Definition of Done "Bac+5" (metier + visuel)

Le projet est considere au niveau cible si:
- Les regles metier sont explicites, testables et non contournables
- Le workflow d'etat apporte une vraie logique produit (pas un simple CRUD)
- Le front a une identite visuelle coherente et memorable
- Les etats UX rendent l'app robuste et pro dans tous les cas (vide/erreur/loading)
- La demo raconte une valeur metier claire, pas juste une suite d'ecrans

---

## 6) Script de demo (7 min) pour effet "wow"

1. Contexte probleme (30s): "publier des histoires avec controle qualite"
2. Creer histoire en `DRAFT` (1 min)
3. Ajouter/modifier chapitres + montrer versionning (1 min)
4. Soumettre en review puis approuver en role reviewer (1 min)
5. Montrer blocage d'une action interdite (40s)
6. Montrer score metier evolutif (40s)
7. Parcours visuel premium sur Story Detail (1 min)
8. Conclusion impact produit/technique (30s)

---

## 7) Prochaine action immediate (aujourd'hui)

- Commencer par P1/Jour 1:
  - definir l'enum des statuts
  - coder les transitions autorisees
  - exposer 1 endpoint de transition
  - ecrire les premiers tests de transition

Si cette base est propre, tout le reste (UI + demo) devient beaucoup plus fort automatiquement.
