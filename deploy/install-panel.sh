#!/usr/bin/env bash
set -euo pipefail
apt-get update
apt-get install -y ca-certificates curl docker.io
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
mkdir -p /opt/ihost
cp -a . /opt/ihost/
cd /opt/ihost
npm install
npm run build
cp deploy/ihost-panel.service /etc/systemd/system/ihost-panel.service
systemctl daemon-reload
systemctl enable --now docker
systemctl enable --now ihost-panel
