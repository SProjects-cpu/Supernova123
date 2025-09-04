#!/bin/bash

# PostgreSQL Integration Setup Script for Event Center
# This script automates the setup process for migrating from Convex to PostgreSQL

echo "🚀 Starting PostgreSQL Integration Setup for Event Center..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "Please install PostgreSQL first:"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo ""
    read -p "Press Enter to continue anyway (you'll need to install PostgreSQL later)..."
fi

echo "✅ Prerequisites check completed"

# Install dependencies
echo "📦 Installing PostgreSQL dependencies..."
npm install pg @types/pg prisma @prisma/client
npm install --save-dev prisma

# Install additional dependencies for authentication and API
echo "📦 Installing authentication and API dependencies..."
npm install jsonwebtoken bcryptjs express cors helmet
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/express @types/cors tsx

echo "✅ Dependencies installed successfully"

# Initialize Prisma
echo "🗂️  Initializing Prisma..."
npx prisma init

echo "✅ Prisma initialized"

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p src/lib/database
mkdir -p src/server/routes
mkdir -p src/server/middleware
mkdir -p src/hooks
mkdir -p scripts

echo "✅ Directory structure created"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_center_db"

# JWT Secret (for authentication)
JWT_SECRET="your-super-secret-jwt-key-here"

# File Upload (if using cloud storage)
CLOUD_STORAGE_BUCKET="your-bucket-name"
CLOUD_STORAGE_REGION="your-region"
CLOUD_STORAGE_ACCESS_KEY="your-access-key"
CLOUD_STORAGE_SECRET_KEY="your-secret-key"

# API Base URL
REACT_APP_API_BASE="http://localhost:3001/api"
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Update package.json scripts
echo "📝 Updating package.json scripts..."
# This is a simplified version - you'll need to manually update your package.json
echo "⚠️  Please manually update your package.json scripts section with:"
echo "   \"dev:backend\": \"tsx src/server/index.ts\","
echo "   \"db:migrate\": \"prisma migrate deploy\","
echo "   \"db:generate\": \"prisma generate\","
echo "   \"db:studio\": \"prisma studio\""

echo ""
echo "🎉 Setup completed successfully!"
echo "=================================================="
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with your actual database credentials"
echo "2. Copy the Prisma schema from POSTGRESQL_INTEGRATION_GUIDE.md to prisma/schema.prisma"
echo "3. Create your PostgreSQL database:"
echo "   psql -U postgres"
echo "   CREATE DATABASE event_center_db;"
echo "   \\q"
echo "4. Run migrations: npx prisma migrate dev --name init"
echo "5. Generate Prisma client: npx prisma generate"
echo "6. Start implementing the database services and API routes"
echo ""
echo "📚 For detailed instructions, see POSTGRESQL_INTEGRATION_GUIDE.md"
echo ""
echo "🔧 To start the development server:"
echo "   npm run dev"
echo ""
echo "🗄️  To view your database with Prisma Studio:"
echo "   npm run db:studio"
