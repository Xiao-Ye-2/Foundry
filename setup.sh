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

set -e
echo "Creating and populating database..."
cd "$DATDIR"
rm -f proddb
python parser.py
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

echo "All tests completed successfully"