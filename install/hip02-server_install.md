# Profile Domain — HIP-0002 Wallet Server

This guide explains how to run `hip02-server.js` in the background on Ubuntu using PM2, with automatic restart and startup after reboot.

## Table of Contents

- [1. Check Node.js and npm](#1-check-nodejs-and-npm)
- [2. Install PM2](#2-install-pm2)
- [3. Start the Wallet Server](#3-start-the-wallet-server)
- [4. Test the Wallet Endpoint](#4-test-the-wallet-endpoint)
- [5. Enable Startup After Reboot](#5-enable-startup-after-reboot)
- [6. Useful PM2 Commands](#6-useful-pm2-commands)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Nginx Integration](#8-nginx-integration)
- [Summary](#summary)

---

## 1. Check Node.js and npm

Verify that Node.js and npm are installed:

```bash
node -v
npm -v
```

If either command is missing, install Node.js and npm before continuing.

## 2. Install PM2

Install PM2 globally using npm:

```bash
sudo npm install -g pm2
```

Verify the installation:

```bash
pm2 -v
```

## 3. Start the Wallet Server

Start `hip02-server.js` using PM2 and assign it the process name `hip02-profile`:

```bash
pm2 start /var/www/profile/hip02-server.js --name hip02-profile
```

Check that it is running:

```bash
pm2 list
```

The process status should be `online`.

## 4. Test the Wallet Endpoint

Test the local wallet discovery endpoint:

```bash
curl -i http://127.0.0.1:3001/.well-known/wallets/HNS
```

The server should return an HTTP response.

## 5. Enable Startup After Reboot

Save the current PM2 process list:

```bash
pm2 save
```

Generate the startup configuration:

```bash
pm2 startup
```

PM2 will display a command. Copy and run the exact command it prints.

Save the process list again:

```bash
pm2 save
```

PM2 will now be configured to restore the saved process list after a system reboot.

## 6. Useful PM2 Commands

### Check running processes

```bash
pm2 list
```

### View logs

```bash
pm2 logs hip02-profile
```

### View the last 50 log lines

```bash
pm2 logs hip02-profile --lines 50
```

### Restart the server

```bash
pm2 restart hip02-profile
```

### Stop the server

```bash
pm2 stop hip02-profile
```

### Start the server again

```bash
pm2 start hip02-profile
```

### Remove the process from PM2

```bash
pm2 delete hip02-profile
```

## 7. Troubleshooting

### Check whether port 3001 is listening

```bash
sudo ss -ltnp | grep ':3001'
```

### Check whether the process is running

```bash
pm2 status
```

### Inspect application errors

```bash
pm2 logs hip02-profile --err --lines 50
```

### If port 3001 is already in use

Identify the process listening on port `3001`:

```bash
sudo ss -ltnp | grep ':3001'
```

Only one process can bind to the same IP address and port combination at a time.

Make sure another application is not already using `127.0.0.1:3001`.

## 8. Nginx Integration

The Nginx configuration proxies wallet discovery requests to the local Node.js server.

Add the following configuration to the appropriate Nginx `server` block:

```nginx
location ~ ^/\.well-known/wallets/(?<symbol>[^/]+)$ {
    proxy_pass http://127.0.0.1:3001/.well-known/wallets/$symbol;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /.well-known/wallets {
    proxy_pass http://127.0.0.1:3001/.well-known/wallets;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Test and reload Nginx

Test the Nginx configuration:

```bash
sudo nginx -t
```

If the test succeeds, reload Nginx:

```bash
sudo systemctl reload nginx
```

Alternatively, run both commands in sequence:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Test the wallet endpoint through Nginx

Replace `your-domain.example` with your actual domain:

```bash
curl -i https://your-domain.example/.well-known/wallets/HNS
```

The server should return the wallet discovery response through Nginx.

---

## Summary

| Setting | Value |
|---|---|
| Application | `/var/www/profile/hip02-server.js` |
| Process manager | PM2 |
| Process name | `hip02-profile` |
| Local backend | `http://127.0.0.1:3001` |
| Wallet discovery path | `/.well-known/wallets/HNS` |
| Automatic process management | Managed by PM2 |
| Startup after reboot | Configured using `pm2 startup` and `pm2 save` |
| Reverse proxy | Nginx |
