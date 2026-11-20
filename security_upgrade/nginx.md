# Nginx security upgrades

## 11/19/2026

### About

- https://nginx2root.com/
- https://laravel.com/forge/docs/knowledge-base/nginx-to-root
- https://xint.io/blog/nginx2root-remote-code-execution

To fix the critical NGINX security vulnerabilities disclosed on November 18, 2026 (known as NGINX2Root, including CVE-2026-123007 and CVE-2026-123633), upgrade NGINX immediately to version 1.30.7 (stable) or 1.31.9 (mainline) and fully restart the service.

### Check if http/2 is installed on my NGinx

```
$ curl -I --http2 https://mysite.com
HTTP/2 200 
server: nginx/1.28.3 (Ubuntu)
date: Fri, 20 Nov 2026 04:42:26 GMT
content-type: text/html
content-length: 13
last-modified: Mon, 06 Apr 2026 06:52:29 GMT
etag: "d-64ec51c3796fc"
accept-ranges: bytes
```

Conclusion: Yes. Needs upgrade.

### Permanent Fix: Update and Restart NGINX

```
$ sudo cp -r /etc/nginx /etc/nginx.backup

$ sudo apt update
$ sudo apt install --only-upgrade nginx
Upgrading:                      
  nginx  nginx-common

Summary:
  Upgrading: 2, Installing: 0, Removing: 0, Not Upgrading: 82
  Download size: 0 B / 657 kB
  Space needed: 2048 B / 27.0 GB available

Continue? [Y/n] Y
...
Setting up nginx (1.28.3-2ubuntu1.13) ...
 * Upgrading binary nginx                                                                                                                                                              [ OK ] 
Processing triggers for ufw (0.36.2-9build1) ...
Rules updated for profile 'OpenSSH'
Skipped reloading firewall

$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

$ sudo systemctl restart nginx

$ dpkg-query -W -f='${Package} ${Version}\n' nginx nginx-common
nginx 1.28.3-2ubuntu1.13
nginx-common 1.28.3-2ubuntu1.13

$ dpkg -l | grep nginx
ii  nginx                    1.28.3-2ubuntu1.13        amd64        small, powerful, scalable web/proxy server
ii  nginx-common             1.28.3-2ubuntu1.13        all          small, powerful, scalable web/proxy server - common files
ii  python3-certbot-nginx    4.0.0-3                   all          Nginx plugin for Certbot

$ sudo rm -rf /etc/nginx.backup
```

`curl -I --http2 https://mysite.com` returns the same result.

But `dpkg-query -W -f='${Package} ${Version}\n' nginx nginx-common` shows it's running the patched version, which is now safe.


### What Was Patched in This Package

Upgrading to 1.28.3-2ubuntu1.13 completely patches your server against all of the November 18 NGINX2Root vulnerabilities.

Even though nginx -v will still display 1.28.3, Ubuntu backported the upstream security fixes directly into package version 1.28.3-2ubuntu1.13 (released under Ubuntu Security Notice USN-9159-1).

According to the Ubuntu 1.28.3-2ubuntu1.13 changelog, this update includes fixes for 
all eight vulnerabilities disclosed in the security advisory:

• HTTP/2 Remote Code Execution: CVE-2026-123007 and CVE-2026-123633
• HTTP/3 (QUIC) & Resolver RCE/DoS: CVE-2026-121810 and CVE-2026-123634
• Mail Proxy, TLS, & Client Cert Flaws: CVE-2026-113425, CVE-2026-118899, CVE-2026-120967, and CVE-2026-123640


### How to upgrade to nginx 1.30.7 (stable)? Is this better?

**I recommend staying on your current Ubuntu package (`1.28.3-2ubuntu1.13`) rather than switching to upstream NGINX 1.30.7**, because you already have the exact same security fixes without taking on extra maintenance work or breaking Ubuntu's package structure.

Switching to `1.30.7` requires adding NGINX's official third-party repository, which replaces Ubuntu's directory layout and dynamic modules.

#### Ubuntu Package vs. Upstream NGINX 1.30.7

| Factor | Your Current Ubuntu Package (`1.28.3-2ubuntu1.13`) | Upstream NGINX Repo (`1.30.7`) |
| :--- | :--- | :--- |
| **Security Patches** | **100% Patched** (Canonical backported all Nov 18 fixes) | **100% Patched** (Includes fixes natively) |
| **Maintenance** | Automatic via standard `sudo apt upgrade` & unattended-upgrades | Requires maintaining an external apt source & GPG key |
| **Config & Modules** | Uses Ubuntu's `sites-available` layout and `libnginx-mod-*` packages | Uses upstream `/etc/nginx/conf.d/` layout; breaks Ubuntu dynamic module packages |
| **New Features** | Locked to 1.28 feature set | Includes newer 1.30 features (minor ACME/QUIC/proxy improvements) |

#### When Switching to 1.30.7 Makes Sense

Only switch to the upstream `1.30.7` repository if:
* **Automated compliance scanners flag `1.28.3`:** Some basic vulnerability scanners only read the `nginx -v` string (`1.28.3`) and trigger false positives because they don't check Ubuntu's patched package version (`-2ubuntu1.13`).
* **You need a specific NGINX 1.30 feature** that isn't available in 1.28.
