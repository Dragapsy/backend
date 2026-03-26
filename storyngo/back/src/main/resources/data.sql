-- ============================================================
-- STORYNGO — Données de démonstration (profil dev / H2)
-- Mot de passe de tous les comptes : password
-- Hash BCrypt de "password" :
--   $2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK
-- ============================================================

-- ============================================================
-- UTILISATEURS
-- ============================================================
INSERT INTO users (id, pseudo, email, password, role, created_at) VALUES
  -- Comptes jury
  (1, 'JuryUser',     'jury-user@storyngo.dev',     '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'USER',     CURRENT_TIMESTAMP),
  (2, 'JuryReviewer', 'jury-reviewer@storyngo.dev', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'REVIEWER', CURRENT_TIMESTAMP),
  (3, 'JuryAdmin',    'jury-admin@storyngo.dev',    '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'ADMIN',    CURRENT_TIMESTAMP),
  -- Auteurs de contenu pour la démo
  (4, 'Elara',   'elara@storyngo.dev',   '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'USER', CURRENT_TIMESTAMP),
  (5, 'Marcus',  'marcus@storyngo.dev',  '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'USER', CURRENT_TIMESTAMP),
  (6, 'Voter1',  'voter1@storyngo.dev',  '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'USER', CURRENT_TIMESTAMP),
  (7, 'Voter2',  'voter2@storyngo.dev',  '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', 'USER', CURRENT_TIMESTAMP);

-- ============================================================
-- PROGRESSION XP (obligatoire — OneToOne avec users)
-- ============================================================
INSERT INTO user_progress (id, user_id, xp, level, level_title, updated_at) VALUES
  (1, 1, 120,  2, 'Apprenti',   CURRENT_TIMESTAMP),
  (2, 2, 450,  4, 'Narrateur',  CURRENT_TIMESTAMP),
  (3, 3, 980,  6, 'Architecte', CURRENT_TIMESTAMP),
  (4, 4, 820,  5, 'Conteur',    CURRENT_TIMESTAMP),
  (5, 5, 310,  3, 'Scribe',     CURRENT_TIMESTAMP),
  (6, 6,  60,  1, 'Novice',     CURRENT_TIMESTAMP),
  (7, 7,  80,  1, 'Novice',     CURRENT_TIMESTAMP);

-- ============================================================
-- HISTOIRES
-- (1) Fantasy      — PUBLISHED  — 3 chapitres (ch.1 unlocked, ch.2 à débloquer)
-- (2) Sci-Fi       — PUBLISHED  — 2 chapitres (ch.1 unlocked)
-- (3) Horreur      — IN_REVIEW  — 1 chapitre  → jury-reviewer peut approuver/rejeter
-- (4) Romance      — DRAFT      — 1 chapitre  → brouillon de jury-user
-- ============================================================
INSERT INTO stories (id, title, summary, created_at, author_id, status) VALUES
  (1, 'Le Royaume des Brumes',
     'Dans un royaume oublié des dieux, une jeune archiviste découvre un grimoire qui parle. Entre complots de cour et magie interdite, elle devra choisir entre la vérité et la survie.',
     CURRENT_TIMESTAMP, 4, 'PUBLISHED'),

  (2, 'Signal 7',
     'Une station orbitale reçoit un signal impossible : il provient de la Terre, mais la Terre n''existe plus. L''équipage de cinq personnes doit décider quoi faire de cette information.',
     CURRENT_TIMESTAMP, 5, 'PUBLISHED'),

  (3, 'La Maison du Bout du Monde',
     'Chaque nuit, les habitants d''un village de montagne entendent des pas sur leur toit. Personne n''ose regarder. Jusqu''au soir où une étrangère arrive en disant qu''elle sait ce que c''est.',
     CURRENT_TIMESTAMP, 4, 'IN_REVIEW'),

  (4, 'Lettres sans Adresse',
     'Elle écrit des lettres à quelqu''un qu''elle n''a jamais rencontré. Un jour, quelqu''un lui répond. Brouillon en cours — histoire de jury-user.',
     CURRENT_TIMESTAMP, 1, 'DRAFT');

-- ============================================================
-- CHAPITRES
-- vote_threshold : seuil de votes pour débloquer le chapitre suivant
-- voting_closed  : TRUE = seuil atteint, chapitre suivant débloqué
-- ============================================================

-- Story 1 — Fantasy (3 chapitres)
INSERT INTO chapters (id, story_id, content, order_index, is_anonymous, vote_threshold, char_limit, voting_closed, created_at) VALUES
  (1, 1,
   'Le vent portait des murmures anciens ce matin-là. Aelindra, archiviste de la Tour Centrale, trouva le grimoire derrière une brique descellée — un livre dont les pages se tournaient seules, dont les mots changeaient selon qui le regardait. Elle ne le referma pas. Elle aurait dû.',
   1, FALSE, 5, 2000, TRUE, CURRENT_TIMESTAMP),

  (2, 1,
   'Le conseiller du roi l''attendait à la sortie des archives. Il souriait, ce qui était mauvais signe. "Mademoiselle Aelindra. On m''a dit que vous aviez trouvé quelque chose d''intéressant." Elle serra le grimoire contre sa poitrine. Le livre lui souffla un seul mot : cours.',
   2, FALSE, 4, 2500, FALSE, CURRENT_TIMESTAMP),

  (3, 1,
   'Le chapitre 3 sera débloqué quand le chapitre 2 atteindra son seuil de votes. Votez pour le chapitre 2 pour voir la suite !',
   3, FALSE, 3, 3000, FALSE, CURRENT_TIMESTAMP);

-- Story 2 — Sci-Fi (2 chapitres)
INSERT INTO chapters (id, story_id, content, order_index, is_anonymous, vote_threshold, char_limit, voting_closed, created_at) VALUES
  (4, 2,
   'Jour 1847 en orbite. Le signal est arrivé à 03h14, heure bord. Fréquence standard, encodage humain, coordonnées GPS parfaitement valides. Le problème : les coordonnées pointaient vers ce qui était autrefois Paris. Et nous, les cinq derniers humains connus, savions très bien que Paris n''existait plus depuis six ans.',
   1, FALSE, 5, 2000, TRUE, CURRENT_TIMESTAMP),

  (5, 2,
   'Commandante Yara coupa le signal et regarda son équipage. Personne ne parlait. Le technicien Brek tapotait son genou — ce tic qu''il avait quand il avait peur. "Quelqu''un a survécu", dit enfin Mira, la biologiste. Yara secoua la tête. "Ou quelque chose veut qu''on le croie."',
   2, FALSE, 4, 2500, FALSE, CURRENT_TIMESTAMP);

-- Story 3 — Horreur IN_REVIEW (1 chapitre)
INSERT INTO chapters (id, story_id, content, order_index, is_anonymous, vote_threshold, char_limit, voting_closed, created_at) VALUES
  (6, 3,
   'Le premier soir, Marta entendit trois pas. Lents. Délibérés. Comme si quelque chose prenait soin de ne pas faire craquer les tuiles. Elle se retourna dans son lit et compta les secondes. Au bout de vingt, le silence revint. Au bout de vingt et un, les pas reprirent — mais à l''intérieur.',
   1, FALSE, 5, 2000, FALSE, CURRENT_TIMESTAMP);

-- Story 4 — Romance DRAFT (1 chapitre)
INSERT INTO chapters (id, story_id, content, order_index, is_anonymous, vote_threshold, char_limit, voting_closed, created_at) VALUES
  (7, 4,
   'Première lettre. Je ne sais pas pourquoi j''écris ceci. Je ne sais pas non plus où je vais l''envoyer. Peut-être nulle part. Peut-être que c''est justement pour ça que je peux écrire la vérité.',
   1, FALSE, 5, 2000, FALSE, CURRENT_TIMESTAMP);

-- ============================================================
-- VERSIONS DE CHAPITRES (historique)
-- ============================================================
INSERT INTO chapter_versions (id, chapter_id, version_number, content, created_at) VALUES
  (1, 1, 1, 'Le vent portait des murmures anciens ce matin-là. [version initiale]', CURRENT_TIMESTAMP),
  (2, 1, 2, 'Le vent portait des murmures anciens ce matin-là. Aelindra, archiviste de la Tour Centrale, trouva le grimoire derrière une brique descellée — un livre dont les pages se tournaient seules, dont les mots changeaient selon qui le regardait. Elle ne le referma pas. Elle aurait dû.', CURRENT_TIMESTAMP),
  (3, 2, 1, 'Le conseiller du roi l''attendait à la sortie des archives. [version initiale]', CURRENT_TIMESTAMP),
  (4, 4, 1, 'Jour 1847 en orbite. Le signal est arrivé à 03h14, heure bord. [version initiale]', CURRENT_TIMESTAMP),
  (5, 4, 2, 'Jour 1847 en orbite. Le signal est arrivé à 03h14, heure bord. Fréquence standard, encodage humain, coordonnées GPS parfaitement valides. Le problème : les coordonnées pointaient vers ce qui était autrefois Paris. Et nous, les cinq derniers humains connus, savions très bien que Paris n''existait plus depuis six ans.', CURRENT_TIMESTAMP);

-- ============================================================
-- VOTES
-- ch.1 story1 : 5 votes (voting_closed=TRUE ✓)
-- ch.2 story1 : 3 votes (seuil=4 → il manque 1 vote → jury-user peut voter !)
-- ch.4 story2 : 5 votes (voting_closed=TRUE ✓)
-- ch.5 story2 : 2 votes (seuil=4 → jury-user peut voter)
-- ============================================================
INSERT INTO votes (id, user_id, chapter_id) VALUES
  -- Chapitre 1 Story 1 (5/5 ✓)
  (1,  2, 1),
  (2,  3, 1),
  (3,  4, 1),
  (4,  6, 1),
  (5,  7, 1),
  -- Chapitre 2 Story 1 (3/4 — jury-user peut être le 4ème vote !)
  (6,  2, 2),
  (7,  5, 2),
  (8,  6, 2),
  -- Chapitre 4 Story 2 (5/5 ✓)
  (9,  1, 4),
  (10, 2, 4),
  (11, 3, 4),
  (12, 6, 4),
  (13, 7, 4),
  -- Chapitre 5 Story 2 (2/4 — jury peut voter)
  (14, 5, 5),
  (15, 6, 5);

-- ============================================================
-- COMMENTAIRES
-- ============================================================
INSERT INTO comments (id, content, user_id, chapter_id, created_at) VALUES
  (1, 'Ce premier chapitre m''a complètement happé. La phrase finale est parfaite.', 6, 1, CURRENT_TIMESTAMP),
  (2, 'L''atmosphère est incroyable, j''attends la suite avec impatience !',          7, 1, CURRENT_TIMESTAMP),
  (3, 'Le conseiller est clairement le grand méchant. Magnifiquement ambigu.',        1, 2, CURRENT_TIMESTAMP),
  (4, 'Ce signal impossible donne vraiment le frisson. Super début.',                 1, 4, CURRENT_TIMESTAMP),
  (5, 'La réplique finale de Yara est excellente. Donne envie de lire la suite.',     6, 5, CURRENT_TIMESTAMP);

-- ============================================================
-- LIKES
-- ============================================================
INSERT INTO story_likes (id, user_id, story_id) VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 6, 1),
  (4, 7, 1),
  (5, 2, 2),
  (6, 5, 1);

-- ============================================================
-- FAVORIS (BOOKMARKS)
-- ============================================================
INSERT INTO story_bookmarks (id, user_id, story_id, created_at) VALUES
  (1, 1, 1, CURRENT_TIMESTAMP),
  (2, 1, 2, CURRENT_TIMESTAMP),
  (3, 6, 2, CURRENT_TIMESTAMP);

-- ============================================================
-- RELATIONS SOCIALES (FOLLOW)
-- ============================================================
INSERT INTO follow_relations (id, follower_id, following_id, created_at) VALUES
  (1, 1, 4, CURRENT_TIMESTAMP),
  (2, 1, 5, CURRENT_TIMESTAMP),
  (3, 6, 4, CURRENT_TIMESTAMP),
  (4, 7, 4, CURRENT_TIMESTAMP),
  (5, 7, 5, CURRENT_TIMESTAMP);

-- ============================================================
-- SIGNALEMENTS (REPORTS) — pour tester le dashboard admin
-- ============================================================
INSERT INTO reports (id, reporter_id, target_id, type, status, priority, reason, created_at) VALUES
  (1, 6, 6, 'CHAPTER',  'OPEN',        'HIGH',   'Contenu potentiellement inapproprié dans ce chapitre d''horreur.', CURRENT_TIMESTAMP),
  (2, 1, 3, 'USER',     'IN_PROGRESS', 'MEDIUM', 'Comportement suspect dans les commentaires.',                       CURRENT_TIMESTAMP),
  (3, 7, 1, 'STORY',    'OPEN',        'LOW',    'Titre trompeur par rapport au contenu.',                            CURRENT_TIMESTAMP);

-- ============================================================
-- RESET DES SÉQUENCES AUTO-INCREMENT
-- ============================================================
ALTER TABLE users            ALTER COLUMN id RESTART WITH 10;
ALTER TABLE stories          ALTER COLUMN id RESTART WITH 10;
ALTER TABLE chapters         ALTER COLUMN id RESTART WITH 10;
ALTER TABLE chapter_versions ALTER COLUMN id RESTART WITH 10;
ALTER TABLE votes            ALTER COLUMN id RESTART WITH 20;
ALTER TABLE comments         ALTER COLUMN id RESTART WITH 10;
ALTER TABLE story_likes      ALTER COLUMN id RESTART WITH 10;
ALTER TABLE story_bookmarks  ALTER COLUMN id RESTART WITH 10;
ALTER TABLE follow_relations ALTER COLUMN id RESTART WITH 10;
ALTER TABLE user_progress    ALTER COLUMN id RESTART WITH 10;
ALTER TABLE reports          ALTER COLUMN id RESTART WITH 10;
