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
  (2, 2, 'Les lampadaires s''eteignirent un a un.', 1, TRUE, 20, 2000, CURRENT_TIMESTAMP);

INSERT INTO votes (id, user_id, chapter_id) VALUES
  (1, 2, 1),
  (2, 3, 2);

INSERT INTO comments (id, content, user_id, chapter_id, created_at) VALUES
  (1, 'Incroyable ambiance !', 2, 1, CURRENT_TIMESTAMP),
  (2, 'Vite la suite.', 3, 2, CURRENT_TIMESTAMP);

ALTER TABLE users ALTER COLUMN id RESTART WITH 5;
ALTER TABLE stories ALTER COLUMN id RESTART WITH 3;
ALTER TABLE chapters ALTER COLUMN id RESTART WITH 3;
ALTER TABLE votes ALTER COLUMN id RESTART WITH 3;
ALTER TABLE comments ALTER COLUMN id RESTART WITH 3;

