CREATE TABLE federal_bills(id INTEGER PRIMARY KEY,
	title VARCHAR(256),
	link VARCHAR(256),
	updateDate DATE,
	govTrack_ID INTEGER);

CREATE INDEX date_index on federal_bills (updateDate);
