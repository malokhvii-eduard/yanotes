-- Seed demo data after Django migrations have created the tables.
--
-- Run manually after migrations when needed:
--   docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" \
--     < api/scripts/demo/seed.sql

DO $$
DECLARE
  demo_user_count constant integer := 30;
  demo_note_count constant integer := 10000;
  -- Default demo user password: 12345678
  demo_password constant text := 'pbkdf2_sha256$260000$yanotesdemoseed$tBtZ7VWXl9MM1sBNJ1FiJac85Ufsy0BZyuzyGUyinWo=';
BEGIN
  IF to_regclass('public.auth_user') IS NULL
    OR to_regclass('public.note') IS NULL
  THEN
    RAISE NOTICE 'Skipped: missing tables.';
    RETURN;
  END IF;

  CREATE TEMP TABLE yanotes_seed_users (
    ord integer PRIMARY KEY,
    username text NOT NULL UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO yanotes_seed_users (ord, username, first_name, last_name)
  VALUES
    (1, 'jon-snow', 'Jon', 'Snow'),
    (2, 'arya-stark', 'Arya', 'Stark'),
    (3, 'sansa-stark', 'Sansa', 'Stark'),
    (4, 'bran-stark', 'Bran', 'Stark'),
    (5, 'robb-stark', 'Robb', 'Stark'),
    (6, 'ned-stark', 'Ned', 'Stark'),
    (7, 'catelyn-stark', 'Catelyn', 'Stark'),
    (8, 'tyrion-lannister', 'Tyrion', 'Lannister'),
    (9, 'jaime-lannister', 'Jaime', 'Lannister'),
    (10, 'cersei-lannister', 'Cersei', 'Lannister'),
    (11, 'daenerys-targaryen', 'Daenerys', 'Targaryen'),
    (12, 'viserys-targaryen', 'Viserys', 'Targaryen'),
    (13, 'jorah-mormont', 'Jorah', 'Mormont'),
    (14, 'samwell-tarly', 'Samwell', 'Tarly'),
    (15, 'brienne-tarth', 'Brienne', 'Tarth'),
    (16, 'theon-greyjoy', 'Theon', 'Greyjoy'),
    (17, 'yara-greyjoy', 'Yara', 'Greyjoy'),
    (18, 'davos-seaworth', 'Davos', 'Seaworth'),
    (19, 'stannis-baratheon', 'Stannis', 'Baratheon'),
    (20, 'renly-baratheon', 'Renly', 'Baratheon'),
    (21, 'robert-baratheon', 'Robert', 'Baratheon'),
    (22, 'margaery-tyrell', 'Margaery', 'Tyrell'),
    (23, 'olenna-tyrell', 'Olenna', 'Tyrell'),
    (24, 'loras-tyrell', 'Loras', 'Tyrell'),
    (25, 'oberyn-martell', 'Oberyn', 'Martell'),
    (26, 'ellaria-sand', 'Ellaria', 'Sand'),
    (27, 'petyr-baelish', 'Petyr', 'Baelish'),
    (28, 'varys-meres', 'Varys', 'Meres'),
    (29, 'melisandre-asshai', 'Melisandre', 'Asshai'),
    (30, 'tormund-giantsbane', 'Tormund', 'Giantsbane');

  IF demo_user_count < 1
    OR demo_user_count > (SELECT count(*) FROM yanotes_seed_users)
  THEN
    RAISE EXCEPTION
      'Invalid user count: % (max %).',
      demo_user_count,
      (SELECT count(*) FROM yanotes_seed_users);
  END IF;

  IF demo_note_count < 1 THEN
    RAISE EXCEPTION 'Invalid note count: %.', demo_note_count;
  END IF;

  DELETE FROM public.note note
  USING public.auth_user app_user, yanotes_seed_users seed_user
  WHERE note.owner_id = app_user.id
    AND app_user.username = seed_user.username;

  DELETE FROM public.auth_user app_user
  USING yanotes_seed_users seed_user
  WHERE app_user.username = seed_user.username;

  INSERT INTO public.auth_user (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined
  )
  SELECT
    demo_password,
    NULL,
    FALSE,
    seed_user.username,
    seed_user.first_name,
    seed_user.last_name,
    seed_user.username || '@example.com',
    FALSE,
    TRUE,
    now() - (((demo_user_count + 1) - seed_user.ord) || ' days')::interval
  FROM yanotes_seed_users seed_user
  WHERE seed_user.ord <= demo_user_count
  ORDER BY seed_user.ord;

  INSERT INTO public.note (title, content, created_at, updated_at, owner_id)
  SELECT
    format(
      '%s #%s',
      CASE note_series.note_no % 5
        WHEN 0 THEN 'Lorem ipsum'
        WHEN 1 THEN 'Dolor sit amet'
        WHEN 2 THEN 'Consectetur adipiscing'
        WHEN 3 THEN 'Eiusmod tempor'
        ELSE 'Magna aliqua'
      END,
      note_series.note_no
    ),
    format(
      '%s %s',
      CASE note_series.note_no % 5
        WHEN 0 THEN 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        WHEN 1 THEN 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        WHEN 2 THEN 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
        WHEN 3 THEN 'Duis aute irure dolor in reprehenderit in voluptate velit esse.'
        ELSE 'Excepteur sint occaecat cupidatat non proident, sunt in culpa.'
      END,
      'Demo note ' || note_series.note_no || ' for ' || seed_user.username || '.'
    ),
    now() - ((demo_note_count - note_series.note_no) || ' minutes')::interval,
    now() - ((demo_note_count - note_series.note_no) || ' minutes')::interval
      + ((note_series.note_no % 60) || ' seconds')::interval,
    app_user.id
  FROM generate_series(1, demo_note_count) AS note_series(note_no)
  JOIN yanotes_seed_users seed_user
    ON seed_user.ord = ((note_series.note_no - 1) % demo_user_count) + 1
  JOIN public.auth_user app_user
    ON app_user.username = seed_user.username
  ORDER BY note_series.note_no;

  RAISE NOTICE 'Seeded: % users, % notes.', demo_user_count, demo_note_count;
END
$$;
