#!/bin/bash

echo "Populating the database..."
sqlite3 proddb << 'END_SQL'
.mode csv
PRAGMA foreign_keys = OFF;

.import --skip 1 Industry.csv Industry
.import --skip 1 Countries.csv Countries
.import --skip 1 Cities.csv Cities
.import --skip 1 Companies.csv Companies

CREATE TEMP TABLE Users_tmp (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    Phone TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    UserName TEXT NOT NULL,
    CityId INTEGER NOT NULL,
    Role TEXT NOT NULL CHECK (Role IN ('employee', 'employer', 'admin')),
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);
.import --skip 1 Users.csv Users_tmp
INSERT INTO Users (UserId, Phone, Email, PasswordHash, UserName, CityId, Role)
SELECT UserId, Phone, NULL, PasswordHash, UserName, CityId, Role FROM Users_tmp;

.import --skip 1 Employers.csv Employers
.import --skip 1 JobPostings.csv JobPostings

# .mode column
# .headers on

# SELECT * FROM Countries;
# SELECT * FROM Cities;
# SELECT * FROM Companies;
# SELECT * FROM Industry;
# SELECT * FROM FocusOn;
# SELECT * FROM Users;
# SELECT * FROM Employees;
# SELECT * FROM Employers;
# SELECT * FROM JobPostings;
# SELECT * FROM Shortlist;
# SELECT * FROM Dislike;
# SELECT * FROM Applications;
END_SQL

echo "Populating complete"
rm *csv
