CREATE TABLE users (
	discord_id TEXT NOT NULL,
	discord_access_token TEXT,
	discord_refresh_token TEXT,
	riot_id TEXT,
	riot_puuid INTEGER,
	CONSTRAINT users_pk PRIMARY KEY (discord_id)
);
