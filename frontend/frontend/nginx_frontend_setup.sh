#!/bin/bash
sudo mkdir -p /var/www/freeds/dist
sudo unzip -o frontend_deploy.zip -d /var/www/freeds/dist
sudo bash -c 'cat > /etc/nginx/sites-available/freeds <<EOF
server {
    listen 80;
    server_name _;

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
