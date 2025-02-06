PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS Dislike;
DROP TABLE IF EXISTS Shortlist;
DROP TABLE IF EXISTS JobPostings;
DROP TABLE IF EXISTS Employers;
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS FocusOn;
DROP TABLE IF EXISTS Industry;
DROP TABLE IF EXISTS Companies;
DROP TABLE IF EXISTS Cities;
DROP TABLE IF EXISTS Countries;

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
    CityId INTEGER NOT NULL,
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Industry
CREATE TABLE Industry (
    IndustryId INTEGER PRIMARY KEY AUTOINCREMENT,
    IndustryName TEXT UNIQUE NOT NULL
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
    CityId INTEGER NOT NULL,
    Role TEXT NOT NULL CHECK (Role IN ('employee', 'employer', 'admin')),
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Employees
CREATE TABLE Employees (
    UserId INTEGER PRIMARY KEY,
    ResumeUrl TEXT,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Table: Employers
CREATE TABLE Employers (
    UserId INTEGER PRIMARY KEY,
    CompanyId INTEGER NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Table: Job Postings
CREATE TABLE JobPostings (
    JobId INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Description TEXT NOT NULL,
    MinSalary REAL NOT NULL CHECK (MinSalary >= 0),
    MaxSalary REAL NOT NULL CHECK (MaxSalary >= MinSalary),
    WorkType TEXT NOT NULL CHECK (WorkType IN ('Full-time', 'Part-time', 'Contract', 'Intern')),
    CityId INTEGER NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT 1,
    PostDate DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
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
    ApplyDate DATE NOT NULL DEFAULT CURRENT_DATE,
    Status TEXT NOT NULL CHECK (Status IN ('Pending', 'Interviewing', 'Accepted', 'Rejected', 'Withdrawn')) DEFAULT 'Pending',
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(UserId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

