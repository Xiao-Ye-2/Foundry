#!/bin/bash
CLASSDIR="$(pwd)"
DATDIR="$CLASSDIR/Database/testdb"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first."
    echo "You can install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install maven"
    echo "  MacOS: brew install maven"
    echo "  Windows: Download from https://maven.apache.org/download.cgi"
    exit 1
fi

echo "Creating and populating database..."
cd "$DATDIR"
rm -f test.db
sqlite3 test.db < createtables.sql
sqlite3 test.db < populatetables.sql

cd "$CLASSDIR"

# Build with Maven
echo "Building with Maven..."
mvn clean compile

# Check if build was successful
if [ ! -d "target/classes" ]; then
    echo "Build failed. ABORT"
    exit 1
fi

echo "TEST 1 STARTS..."

# Run QueryDB tests
mvn exec:java -Dexec.mainClass="QueryDB" << INPUT
1
112348546
2
112348546
Database Systems, Operating System Design
3
Database Systems
0
INPUT

# Run MaintainDB tests
mvn exec:java -Dexec.mainClass="MaintainDB" << INPUT
1
Data Privacy, MWF 14, R129, 242518965
2
1
0
INPUT

sleep 2