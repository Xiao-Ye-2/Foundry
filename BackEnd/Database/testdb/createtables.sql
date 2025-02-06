-- Table: Countries
CREATE TABLE Countries (
    CountryId INTEGER PRIMARY KEY AUTOINCREMENT,
    CountryName TEXT UNIQUE NOT NULL
);

-- Table: Cities
CREATE TABLE Cities (
    CityId INTEGER PRIMARY KEY AUTOINCREMENT,
    CityName TEXT NOT NULL,
    CountryId INTEGER NOT NULL,
    FOREIGN KEY (CountryId) REFERENCES Countries(CountryId),
    UNIQUE (CityName, CountryId)
);

-- Table: Companies
CREATE TABLE Companies (
    CompanyId INTEGER PRIMARY KEY AUTOINCREMENT,
    CompanyName TEXT UNIQUE NOT NULL,
    Size INTEGER,
    CityId INTEGER,
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Industry
CREATE TABLE Industry (
    IndustryId INTEGER PRIMARY KEY,
    IndustryName TEXT NOT NULL
);

-- Table: FocusOn (Relationship between Company and Industry)
CREATE TABLE FocusOn (
    CompanyId INTEGER NOT NULL,
    IndustryId INTEGER NOT NULL,
    PRIMARY KEY (CompanyId, IndustryId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (IndustryId) REFERENCES Industry(IndustryId)
);

-- Table: Users
CREATE TABLE Users (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    CityId INTEGER,
    Role TEXT CHECK (Role IN ('employee', 'employer', 'admin'))  -- Optional
);

-- Table: Employees
CREATE TABLE Employees (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    ResumeUrl TEXT,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Table: Employers
CREATE TABLE Employers (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    CompanyId INTEGER NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Table: Job Postings
CREATE TABLE JobPostings (
    JobId INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    MinSalary REAL CHECK (MinSalary >= 0),
    MaxSalary REAL CHECK (MaxSalary >= MinSalary),
    WorkType TEXT CHECK (WorkType IN ('Full-time', 'Part-time', 'Contract', 'Intern')),
    CityId INTEGER NOT NULL,
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Post (Relationship between Employer and Job)
CREATE TABLE Post (
    EmployerId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployerId, JobId),
    FOREIGN KEY (EmployerId) REFERENCES Employers(UserId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

-- Table: Shortlist (Relationship between Employee and Job)
CREATE TABLE Shortlist (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(UserId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

-- Table: Dislike (Relationship between Employee and Job)
CREATE TABLE Dislike (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(UserId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

-- Table: Applications
CREATE TABLE Applications (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    ApplyDate TEXT NOT NULL,
    Status TEXT DEFAULT 'Pending',
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(UserId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

