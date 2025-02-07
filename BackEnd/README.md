# Job Board Application

## Overview
A Spring Boot application providing REST APIs for a job board system, allowing employers to post jobs and employees to search and apply for positions.

## Prerequisites
- SQLite3
- Maven
- curl

## Database Setup
1. Navigate to the Database/testdb directory:
```
cd Database/testdb
```

2. Create and populate the database:
```
rm -f testdb
sqlite3 testdb < createtables.sql
./populatetables.sh
```

##### The database schema: `Database/testdb/createtables.sql`

## Running the Application

1. Build and start the Spring Boot application:
```
mvn clean spring-boot:run
```

2. Run the test script:
```
./test.sh
```

##### sample test sql file: `Database/testdb/test-sample.sql`

## API Documentation
### 1. Search for jobs
GET /api/jobs/search
```
curl -X GET "http://localhost:8080/api/jobs/search?location=Toronto&workType=Intern"
```
Optional parameters:
- `location`: The city where the job is located.
- `workType`: The type of work the job requires.
- `minSalary`: The minimum salary for the job.

### 2. Apply for a job
POST /api/jobs/apply
```
curl -X POST "http://localhost:8080/api/jobs/apply" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "jobId": "1"
  }'
```

### 3.Post a job
POST /api/jobs/post
```
curl -X POST "http://localhost:8080/api/jobs/post" \
    -H "Content-Type: application/json" \
    -H "user-id: 2" \
    -d '{
    "title": "Software Engineer",
    "description": "Test position",
    "minSalary": 60000,
    "maxSalary": 80000,
    "workType": "Full-time",
    "cityId": 1
}'
```

### 4. View Applications
GET /api/jobs/applications
```
curl -X GET -H "user-id: 2" "http://localhost:8080/api/jobs/applications"
```

### 5. Update Employee Profile
PUT /api/employees/profile
```
curl -X PUT "http://localhost:8080/api/employees/profile" \
  -H "Content-Type: application/json" \
  -H "user-id: 1" \
  -d '{"resumeUrl":"resumes/john_doe.pdf"}'
```

## Testing
The test script (test.sh) performs basic API tests to ensure the application is working correctly.

## Set up the frontend
Need Node.js and npm installed. Install here: https://nodejs.org/en/download/
1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Start the frontend:
```
npm run dev 
```

4. Open your browser and navigate to `http://localhost:5173` to view the application.


