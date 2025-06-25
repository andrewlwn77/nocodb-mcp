#!/bin/bash

# Test script for NocoDB MCP Server
# This script helps test the server during development

echo "Starting NocoDB MCP Server..."
echo "Make sure you have:"
echo "1. NocoDB running (default: http://localhost:8080)"
echo "2. .env file configured with NOCODB_API_TOKEN"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Run the server
npm run dev