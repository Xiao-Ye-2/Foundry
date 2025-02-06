--1. Users can filter jobs based on min salary, workType, city, company
SELECT Title, Description, MinSalary, MaxSalary, WorkType, (SELECT CityName FROM Cities WHERE CityId = j.CityId) AS location
FROM JobPostings J
JOIN Employers E ON E.UserId = J.EmployerId
JOIN Companies Com ON Com.CompanyId = E.CompanyId
JOIN Cities Cit ON Cit.CityId = J.CityId
WHERE MinSalary >= 60000 AND workType = "Full-time" AND Cit.CityName = "New York" AND Com.CompanyName == "Google";

--Employees can see company's profile (name, location, industry, Size)
SELECT CompanyName, (SELECT CityName FROM Cities WHERE CityId = Com.CityId) AS location, (SELECT IndustryName FROM Industry WHERE IndustryId = F.IndustryId) AS Industry, Size
FROM Companies Com
JOIN FocusOn F ON Com.CompanyId = F.CompanyId
Where Com.CompanyName == "Google";

--Employers can post new job postings
INSERT INTO JobPostings (EmployerId, Title, Description, MinSalary, MaxSalary, WorkType, CityId, IsActive, PostDate)
VALUES (2, 'Product Manager', 'manage products', 90000, 150000, "Full-time", 1, 1, CURRENT_DATE);
SELECT * FROM JobPostings;

--Employees can apply/Dislike/Shortlist job postings
INSERT INTO Applications (EmployeeId, JobId, status)
VALUES (1, 1, 'Pending');
SELECT * FROM Applications;

--Employees can view all their applications/Dislikes/Shortlists
SELECT J.Title, J.Description, J.IsActive, A.ApplyDate, A.Status
FROM Applications A
JOIN JobPostings J ON A.JobId = J.JobId
WHERE A.EmployeeId = 1;

--Employees can manage its profile (location, resume)
UPDATE Employees
SET ResumeUrl = 'resumes/john_doe.pdf'
WHERE UserId = 1;
SELECT * FROM Employees;