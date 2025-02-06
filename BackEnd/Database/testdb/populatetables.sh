sqlite3 test.db ".mode csv" "PRAGMA foreign_keys = ON;" \
".import Countries.csv Countries" \
".import Cities.csv Cities" \
".import Companies.csv Companies" \
".import Industry.csv Industry" \
".import FocusOn.csv FocusOn" \
".import Users.csv Users" \
".import Employees.csv Employees" \
".import Employers.csv Employers" \
".import JobPostings.csv JobPostings" \
".import Shortlist.csv Shortlist" \
".import Dislike.csv Dislike" \
".import Applications.csv Applications"

sqlite3 test.db \
".mode column" \
".headers on" \
"SELECT * FROM Countries;" \
"SELECT * FROM Cities;" \
"SELECT * FROM Companies;" \
"SELECT * FROM Industry;" \
"SELECT * FROM FocusOn;" \
"SELECT * FROM Users;" \
"SELECT * FROM Employees;" \
"SELECT * FROM Employers;" \
"SELECT * FROM JobPostings;" \
"SELECT * FROM Shortlist;" \
"SELECT * FROM Dislike;" \
"SELECT * FROM Applications;"
