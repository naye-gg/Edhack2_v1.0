#!/bin/bash

# FlexIAdapt Database Setup Script
# This script sets up a local PostgreSQL database for FlexIAdapt

set -e

echo "🚀 Setting up FlexIAdapt database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   sudo dnf install postgresql postgresql-server postgresql-contrib"
    echo "   sudo systemctl enable postgresql"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! systemctl is-active --quiet postgresql; then
    echo "🔄 Starting PostgreSQL service..."
    sudo systemctl start postgresql
fi

# Database configuration
DB_NAME="FlexIAdapt"
DB_USER="FlexIAdapt_user"
DB_PASSWORD="FlexIAdapt_password_2025"
DB_HOST="localhost"
DB_PORT="5432"

echo "📝 Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING UTF8'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME');
\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

# Update .env file with database URL
DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo "🔧 Updating .env file..."
if [ -f .env ]; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
else
    echo "DATABASE_URL=$DATABASE_URL" > .env
    echo "PORT=5000" >> .env
    echo "NODE_ENV=development" >> .env
    echo "SESSION_SECRET=FlexIAdapt-development-secret-key-2025" >> .env
    echo "MAX_FILE_SIZE=104857600" >> .env
    echo "CLIENT_URL=http://localhost:5000" >> .env
    echo "API_URL=http://localhost:5000/api" >> .env
fi

echo "✅ Database setup completed!"
echo "📊 Database URL: $DATABASE_URL"
echo ""
echo "Next steps:"
echo "1. Run: pnpm db:push"
echo "2. Run: pnpm dev"
