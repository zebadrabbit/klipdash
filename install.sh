#!/bin/bash

# Exit on error
set -e

# Detect current user and working directory
USER=$(whoami)
WORKDIR=$(pwd)

SERVICE_NAME="klipdash.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"

echo "Creating systemd service for KlipDash..."

# Create the service file content
cat <<EOF | sudo tee $SERVICE_PATH > /dev/null
[Unit]
Description=KlipDash Printer Dashboard
After=network.target

[Service]
User=$USER
WorkingDirectory=$WORKDIR
ExecStart=/usr/bin/python3 app.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Set permissions and enable the service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo "✅ KlipDash service installed and started successfully."
