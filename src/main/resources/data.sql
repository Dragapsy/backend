INSERT INTO users (id, pseudo, email, password, created_at) VALUES
  (1, 'Auteur', 'auteur@storyngo.dev', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', CURRENT_TIMESTAMP),
  (2, 'Lecteur', 'lecteur@storyngo.dev', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', CURRENT_TIMESTAMP),
  (3, 'Voter1', 'voter1@storyngo.dev', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', CURRENT_TIMESTAMP),
  (4, 'Voter2', 'voter2@storyngo.dev', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5I3Q9wQJxRrHf1YtX7JdYz4aP1u3lK', CURRENT_TIMESTAMP);

INSERT INTO stories (id, title, summary, created_at, author_id) VALUES
  (1, 'Royaume des Brumes', 'Fantasy : un royaume oublie se reveille.', CURRENT_TIMESTAMP, 1),
  (2, 'Nuit Sans Fin', 'Horreur : une ville plongee dans l''ombre.', CURRENT_TIMESTAMP, 1);

INSERT INTO chapters (id, story_id, content, order_index, is_anonymous, vote_threshold, char_limit, created_at) VALUES
  (1, 1, 'Le vent portait des murmures anciens.', 1, FALSE, 20, 2000, CURRENT_TIMESTAMP),
  (2, 1, 'La foret avala leurs pas.', 2, FALSE, 15, 3000, CURRENT_TIMESTAMP),
  (3, 2, 'Les lampadaires s''eteignirent un a un.', 1, TRUE, 10, 2000, CURRENT_TIMESTAMP),
  (4, 2, 'Une silhouette se glissa dans la ruelle.', 2, TRUE, 5, 3000, CURRENT_TIMESTAMP),
  (5, 2, 'Le silence devint assourdissant.', 3, FALSE, 5, 4000, CURRENT_TIMESTAMP);

INSERT INTO votes (id, user_id, chapter_id) VALUES
  (1, 1, 4),
  (2, 2, 4),
  (3, 3, 4),
  (4, 4, 4);

INSERT INTO comments (id, content, user_id, chapter_id, created_at) VALUES
  (1, 'Incroyable ambiance !', 2, 1, CURRENT_TIMESTAMP),
  (2, 'Vite la suite.', 3, 4, CURRENT_TIMESTAMP);

