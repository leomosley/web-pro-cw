CREATE TABLE IF NOT EXISTS location (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT,
  postcode VARCHAR(7) NOT NULL
);

CREATE TABLE IF NOT EXISTS race (
  race_id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL,
  race_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  check_in_open_time TIME NOT NULL,
  race_start_time TIME NOT NULL,
  FOREIGN KEY (location_id) REFERENCES location (location_id)
);

CREATE TABLE IF NOT EXISTS checkpoint (
  checkpoint_id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkpoint_position INTEGER NOT NULL,
  name TEXT
);


CREATE TABLE IF NOT EXISTS race_checkpoint (
  race_id INTEGER NOT NULL,
  checkpoint_id INTEGER NOT NULL,
  PRIMARY KEY (race_id, checkpoint_id),
  FOREIGN KEY (race_id) REFERENCES race (race_id),
  FOREIGN KEY (checkpoint_id) REFERENCES checkpoint (checkpoint_id)
);

CREATE TABLE IF NOT EXISTS participant (
  participant_id CHAR(5) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS race_participant (
  race_id INTEGER NOT NULL,
  participant_id CHAR(5) NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  end_time TIME,
  race_time TIME,
  PRIMARY KEY (race_id, participant_id),
  FOREIGN KEY (race_id) REFERENCES race (race_id),
  FOREIGN KEY (participant_id) REFERENCES participant (participant_id)
);

CREATE TRIGGER update_race_time
AFTER UPDATE OF end_time ON race_participant
FOR EACH ROW
WHEN NEW.end_time IS NOT NULL
BEGIN
  UPDATE race_participant
  SET race_time = 
    strftime('%H:%M:%S', 
      julianday(NEW.end_time) - julianday((SELECT race_start_time FROM race WHERE race_id = NEW.race_id))
    )
  WHERE race_id = NEW.race_id AND participant_id = NEW.participant_id;
END;

