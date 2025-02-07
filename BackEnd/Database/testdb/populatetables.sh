#!/bin/bash

sqlite3 testdb << 'END_SQL'
.mode csv
PRAGMA foreign_keys = ON;

.import --skip 1 Industry.csv Industry
.import --skip 1 Countries.csv Countries
.import --skip 1 Cities.csv Cities
.import --skip 1 Companies.csv Companies
.import --skip 1 Users.csv Users
.import --skip 1 FocusOn.csv FocusOn
.import --skip 1 Employees.csv Employees
.import --skip 1 Employers.csv Employers
.import --skip 1 JobPostings.csv JobPostings
.import --skip 1 Shortlist.csv Shortlist
.import --skip 1 Dislike.csv Dislike
.import --skip 1 Applications.csv Applications

.mode column
.headers on

SELECT * FROM Cities;
SELECT * FROM Companies;
SELECT * FROM Industry;
SELECT * FROM FocusOn;
SELECT * FROM Users;
SELECT * FROM Employees;
SELECT * FROM Employers;
SELECT * FROM JobPostings;
SELECT * FROM Shortlist;
SELECT * FROM Dislike;
SELECT * FROM Applications;
END_SQL
