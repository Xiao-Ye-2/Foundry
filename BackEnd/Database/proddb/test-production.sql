--1. Users can filter jobs based on min salary, workType, city, company
SELECT Title, Description, MinSalary, MaxSalary, WorkType, (SELECT CityName FROM Cities WHERE CityId = j.CityId) AS location
FROM JobPostings J
JOIN Employers E ON E.UserId = J.EmployerId
JOIN Companies Com ON Com.CompanyId = E.CompanyId
JOIN Cities Cit ON Cit.CityId = J.CityId
WHERE MinSalary >= 30 AND workType = "Full-time"
Limit 10;

--2. Employees can see company's profile (name, location, industry, Size)
SELECT CompanyName, (SELECT CityName FROM Cities WHERE CityId = Com.CityId) AS location, Size
FROM Companies Com
Where Com.Size > 1000
Limit 10;

--3. Employers can post new job postings
DELETE FROM JobPostings WHERE Description = 'manage products';
INSERT INTO JobPostings (EmployerId, Title, Description, MinSalary, MaxSalary, WorkType, CityId, IsActive, PostDate)
VALUES (2, 'Product Manager', 'manage products', 90000, 150000, "Full-time", 1, 1, CURRENT_DATE);
SELECT * FROM JobPostings J
WHERE J.Description = 'manage products';

--4. Employees can apply/Dislike/Shortlist job postings
INSERT INTO Applications (EmployeeId, JobId, status)
VALUES (1, 1, 'Pending');
SELECT * FROM Applications
WHERE EmployeeId = 1;

--5. Employees can view all their applications/Dislikes/Shortlists
SELECT J.Title, J.Description, J.IsActive, A.ApplyDate, A.Status
FROM Applications A
JOIN JobPostings J ON A.JobId = J.JobId
WHERE A.EmployeeId = 1
Limit 10;

--6. Employees can manage its profile (location, resume)
UPDATE Employees
SET ResumeUrl = 'resumes/john_doe.pdf'
WHERE UserId = 1615934;
SELECT * FROM Employees;
