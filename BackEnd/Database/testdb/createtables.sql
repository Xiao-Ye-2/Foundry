-- Table: Users
CREATE TABLE Users (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Role TEXT CHECK (Role IN ('employee', 'employer', 'admin'))  -- Optional
);

-- Table: Employees
CREATE TABLE Employees (
    EmployeeId INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    ResumeUrl TEXT,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Table: Employers
CREATE TABLE Employers (
    EmployerId INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    CompanyId INTEGER NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Table: Companies
CREATE TABLE Companies (
    CompanyId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL,
    Size INTEGER,
    Profile TEXT
);

-- Table: Job Postings
CREATE TABLE JobPostings (
    JobId INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    MinSalary REAL CHECK (MinSalary >= 0),
    MaxSalary REAL CHECK (MaxSalary >= MinSalary),
    WorkType TEXT CHECK (WorkType IN ('Full-time', 'Part-time', 'Contract', 'Intern')),
    EmployerId INTEGER NOT NULL,
    CityId INTEGER NOT NULL,
    FOREIGN KEY (EmployerId) REFERENCES Employers(EmployerId),
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Job
CREATE TABLE Job (
    JobId INTEGER PRIMARY KEY,
    Title TEXT NOT NULL,
    MinSalary REAL,
    MaxSalary REAL,
    WorkType TEXT CHECK (WorkType IN ('Full-time', 'Part-time', 'Contract', 'Intern')),
    EmployerId INTEGER NOT NULL,
    CityId INTEGER NOT NULL,
    FOREIGN KEY (EmployerId) REFERENCES Employers(EmployerId),
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

-- Table: Applications
CREATE TABLE Applications (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    ApplyDate DATE NOT NULL,
    Status TEXT DEFAULT 'Pending',
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employee(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES Job(JobId)
);

-- Table: Cities
CREATE TABLE Cities (
    CityId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL
);

-- Table: Countries
CREATE TABLE Countries (
    CountryId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL
);

-- Table: Industry
CREATE TABLE Industry (
    IndustryId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

-- Table: FocusOn (Relationship between Company and Industry)
CREATE TABLE FocusOn (
    CompanyId INTEGER NOT NULL,
    IndustryId INTEGER NOT NULL,
    PRIMARY KEY (CompanyId, IndustryId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (IndustryId) REFERENCES Industry(IndustryId)
);

-- Table: City
CREATE TABLE City (
    CityId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

-- Table: Country
CREATE TABLE Country (
    CountryId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

-- Table: LocateAt (Relationship between Company and City)
CREATE TABLE LocateAt (
    CompanyId INTEGER NOT NULL,
    CityId INTEGER NOT NULL,
    PRIMARY KEY (CompanyId, CityId),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (CityId) REFERENCES City(CityId)
);

-- Table: In (Relationship between City and Country)
CREATE TABLE InCountry (
    CityId INTEGER NOT NULL,
    CountryId INTEGER NOT NULL,
    PRIMARY KEY (CityId, CountryId),
    FOREIGN KEY (CityId) REFERENCES City(CityId),
    FOREIGN KEY (CountryId) REFERENCES Country(CountryId)
);

-- Table: Post (Relationship between Employer and Job)
CREATE TABLE Post (
    EmployerId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployerId, JobId),
    FOREIGN KEY (EmployerId) REFERENCES Employers(EmployerId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

-- Table: Shortlist (Relationship between Employee and Job)
CREATE TABLE Shortlist (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);

-- Table: Dislike (Relationship between Employee and Job)
CREATE TABLE Dislike (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES JobPostings(JobId)
);
