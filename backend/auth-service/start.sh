#!/bin/bash

# Bennett Network - Auth Service Startup Script
# This script starts MongoDB, Redis, and the Auth Service

echo "🚀 Starting Bennett Network Auth Service..."
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "⚠️  MongoDB not running. Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || sudo service mongod start 2>/dev/null || mongod --fork --logpath /var/log/mongodb/mongod.log 2>/dev/null
    sleep 2
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB started successfully"
    else
        echo "❌ Failed to start MongoDB. Please start it manually."
        exit 1
    fi
fi

# Check if Redis is running
echo "📦 Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is already running"
else
    echo "⚠️  Redis not running. Starting Redis..."
    redis-server --daemonize yes
    sleep 1
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis started successfully"
    else
        echo "⚠️  Failed to start Redis. Service will run without cache."
    fi
fi

echo ""
echo "🎯 Starting Auth Service..."
npm start
