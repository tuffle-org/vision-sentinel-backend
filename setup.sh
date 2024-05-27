#!/bin/bash

DOMAIN_NAME="16.171.162.139"
NGINX_CONFIG_FILE="/etc/nginx/sites-available/pm"
PORT="5001"

POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pbh5!eyFcncRjcZ6"
POSTGRES_DB="vision"


sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.10.0 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs


# Install Nginx
sudo apt-get install -y nginx

# Start and enable Nginx service
sudo systemctl start nginx
sudo systemctl enable nginx

# Display installation information
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo "Nginx version: $(nginx -v 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

# Print additional instructions
echo "Environment setup completed."
echo "Don't forget to configure your Node.js application and Nginx according to your project requirements."

echo "Setting up nginx configuration with pm app"

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a PostgreSQL user and database


sudo -u postgres psql -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"

sudo rm -f /etc/nginx/sites-available/pm
sudo rm -f /etc/nginx/sites-enabled/pm

# Set up Nginx configuration
sudo bash -c "cat > $NGINX_CONFIG_FILE" <<EOL
server {
    listen 80;
    server_name test.peaksender.com;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

}
EOL

# Create a symbolic link to enable the Nginx site
sudo ln -s $NGINX_CONFIG_FILE /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx



# Install Node.js 20.10.0 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs


# Define the .env file path
ENV_FILE=".env"

# Define the content to be added to the .env file
ENV_CONTENT='DATABASE_URL="postgresql://postgres:pbh5!eyFcncRjcZ6@localhost:5432/vision?schema=public"
PORT=5001
JWT_SECRET="jsaf848*928kdfsKF23^*MDJD6Hsks%js"
USERNAME="admin"
PASSWORD="1234"'

#installing packages
sudo npm i

sudo npx prisma generate
sudo npx prisma migrate deploy

echo "DONE OK!"

sudo npm i -g pm2 
sudo npm run build
sudo pm2 start "npm start" --name "backendapp"