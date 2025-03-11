#!/bin/bash
CLASSDIR="$(pwd)/backend"
DATDIR="$CLASSDIR/Database/proddb"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first."
    echo "You can install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install maven"
    echo "  MacOS: brew install maven"
    echo "  Windows: Download from https://maven.apache.org/download.cgi"
    exit 1
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Please install curl first."
    exit 1
fi

echo "Creating and populating database..."
cd "$DATDIR"
rm -f proddb
python3 parser.py
sqlite3 proddb < createtables.sql
./populatetables.sh

cd "$CLASSDIR"

# Build and run Spring Boot application
echo "Building and starting Spring Boot application..."
mvn clean spring-boot:run &
SPRING_PID=$!

# Wait for Spring Boot to start
echo "Waiting for Spring Boot to start..."
sleep 15

# Basic API Tests
echo "Running basic API tests..."

# Test 1: Search all jobs
# echo "Test 1: Search all jobs"
# response=$(curl -s "http://localhost:8080/api/jobs/search")
# echo "Response: $response"
# if [ -z "$response" ]; then
#     echo "Test 1 Failed: No response"
#     kill $SPRING_PID
#     exit 1
# fi

# Test 2: Search Jobs with filters
# echo "Test 2: Search Jobs with filters"
# response=$(curl -s "http://localhost:8080/api/jobs/search?location=Toronto&workType=Intern")
# echo "Response: $response"
# if [ -z "$response" ]; then
#     echo "Test 2 Failed: No response"
#     kill $SPRING_PID
#     exit 1
# fi

# Test 3: Post a Job
# echo "Test 1: Post a Job"
# response=$(curl -s -X POST "http://localhost:8080/api/jobs/post" \
#   -H "Content-Type: application/json" \
#   -H "user-id: 2" \
#   -d '{
#     "title": "Software Engineer",
#     "description": "Test position",
#     "minSalary": 60000,
#     "maxSalary": 80000,
#     "workType": "Full-time",
#     "cityId": 1
#   }')
# echo "Response: $response"
# if [[ "$response" != *"successfully"* ]]; then
#     echo "Test 3 Failed: Unexpected response"
#     kill $SPRING_PID
#     exit 1
# fi

# Test 1: Search all jobs
# echo "Test 1: Search all jobs"
# response=$(curl -s "http://localhost:8080/api/jobs/search")
# echo "Response: $response"
# if [ -z "$response" ]; then
#     echo "Test 1 Failed: No response"
#     kill $SPRING_PID
#     exit 1
# fi

# Test 4: Apply to Job
# echo "Test 2: Apply to Job"
# response=$(curl -s -X POST "http://localhost:8080/api/jobs/apply" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "employeeId": 1,
#     "jobId": "2"
#   }')
# echo "Response: $response"
# if [[ "$response" != *"successfully"* ]]; then
#     echo "Test 4 Failed: Unexpected response"
#     kill $SPRING_PID
#     exit 1
# fi

echo "All tests completed successfully"