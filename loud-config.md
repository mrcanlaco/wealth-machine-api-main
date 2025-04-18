#cloud-config
package_update: true
package_upgrade: true

packages:
  - curl
  - wget
  - git
  - build-essential
  - nginx
  - python3-certbot-nginx

runcmd:
  # Install Node.js
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs
  - npm install -g npm@latest

  # Install bun.sh
  - curl -fsSL https://bun.sh/install | bash
  - echo 'export BUN_INSTALL="$HOME/.bun"' >> /root/.bashrc
  - echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /root/.bashrc

  # Install PM2
  - npm install -g pm2

  # Configure Nginx
  - |
    cat > /etc/nginx/sites-available/default <<'EOF'
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        
        server_name _;
        
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    EOF

  # Create test page
  - |
    cat > /var/www/html/index.html <<'EOF'
    <!DOCTYPE html>
    <html>
    <head>
        <title>Server is running!</title>
    </head>
    <body>
        <h1>Congratulations!</h1>
        <p>Your server is successfully configured with Node.js, npm, bun.sh, PM2, and Nginx.</p>
    </body>
    </html>
    EOF

  # Set permissions
  - chown -R www-data:www-data /var/www/html
  - systemctl restart nginx

  # Create a status script
  - |
    cat > /usr/local/bin/check-versions <<'EOF'
    #!/bin/bash
    echo "Node.js: $(node -v)"
    echo "npm: $(npm -v)"
    echo "bun: $(bun -v)"
    echo "PM2: $(pm2 -v)"
    echo "Nginx: $(nginx -v)"
    EOF
  - chmod +x /usr/local/bin/check-versions

final_message: "The system is now configured and ready to use!"