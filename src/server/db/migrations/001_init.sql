CREATE TABLE IF NOT EXISTS race (
  race_id CHAR(5) PRIMARY KEY,
  race_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  check_in_open_time TIME NOT NULL,
  race_start_time TIME NOT NULL,
  race_end_time TIME,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS race_checkpoint (
  checkpoint_id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id CHAR(5) NOT NULL,
  checkpoint_position INTEGER NOT NULL,
  checkpoint_name TEXT NOT NULL,
  FOREIGN KEY (race_id) REFERENCES race (race_id)
);

CREATE TABLE IF NOT EXISTS participant (
  participant_id CHAR(5) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS race_participant (
  race_id CHAR(5) NOT NULL,
  participant_id CHAR(5) NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  finish_position INTEGER, 
  PRIMARY KEY (race_id, participant_id),
  FOREIGN KEY (race_id) REFERENCES race (race_id),
  FOREIGN KEY (participant_id) REFERENCES participant (participant_id)
);

CREATE TABLE IF NOT EXISTS race_position (
  race_id CHAR(5) NOT NULL,
  finish_position INTEGER NOT NULL,
  finish_time TIME NOT NULL,
  PRIMARY KEY (race_id, finish_position),
  FOREIGN KEY (race_id) REFERENCES race (race_id)
);
