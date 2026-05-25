#!/bin/bash
sudo mkdir -p /var/www/freeds/dist
sudo unzip -o frontend_deploy.zip -d /var/www/freeds/dist
sudo bash -c 'cat > /etc/nginx/sites-available/freeds <<EOF
server {
    listen 80;
    server_name 3.228.14.242 freeds.io1;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 3.228.14.242 freeds.io1;

    ssl_certificate /etc/letsencrypt/live/freeds.io1/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/freeds.io1/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/freeds/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'
sudo nginx -t
sudo systemctl reload nginx
