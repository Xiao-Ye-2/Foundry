-- Table: Users
CREATE TABLE Users (
    Uid INTEGER PRIMARY KEY,
    Username TEXT NOT NULL,
    ResumeUrl TEXT
);

-- Table: Employer
CREATE TABLE Employer (
    EmployerId INTEGER PRIMARY KEY,
    Uid INTEGER NOT NULL,
    FOREIGN KEY (Uid) REFERENCES Users(Uid)
);

-- Table: Employee
CREATE TABLE Employee (
    EmployeeId INTEGER PRIMARY KEY,
    Uid INTEGER NOT NULL,
    FOREIGN KEY (Uid) REFERENCES Users(Uid)
);

-- Table: Company
CREATE TABLE Company (
    CompanyId INTEGER PRIMARY KEY,
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
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId),
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
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId),
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

-- Table: Job
CREATE TABLE Job (
    JobId INTEGER PRIMARY KEY,
    Title TEXT NOT NULL,
    EmployerId INTEGER NOT NULL,
    FOREIGN KEY (EmployerId) REFERENCES Employer(EmployerId)
);

-- Table: Post (Relationship between Employer and Job)
CREATE TABLE Post (
    EmployerId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployerId, JobId),
    FOREIGN KEY (EmployerId) REFERENCES Employer(EmployerId),
    FOREIGN KEY (JobId) REFERENCES Job(JobId)
);

-- Table: Apply (Relationship between Employee and Job)
CREATE TABLE Apply (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    ApplyDate DATE NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employee(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES Job(JobId)
);

-- Table: Shortlist (Relationship between Employee and Job)
CREATE TABLE Shortlist (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employee(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES Job(JobId)
);

-- Table: Dislike (Relationship between Employee and Job)
CREATE TABLE Dislike (
    EmployeeId INTEGER NOT NULL,
    JobId INTEGER NOT NULL,
    PRIMARY KEY (EmployeeId, JobId),
    FOREIGN KEY (EmployeeId) REFERENCES Employee(EmployeeId),
    FOREIGN KEY (JobId) REFERENCES Job(JobId)
);
