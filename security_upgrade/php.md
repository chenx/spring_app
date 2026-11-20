# Security Upgrade: PHP

## 10/21/2026 

### PHP2Shell vulnerability

https://www.wiz.io/blog/php2shell-php-rce

### Upgrade

```
$ dpkg-query -W -f='${Version}\n' php8.5-fpm
8.5.4-0ubuntu1.4

$ php-fpm8.5 -v
PHP 8.5.4 (fpm-fcgi) (built: Oct 13 2026 14:35:18) (NTS)
Copyright (c) The PHP Group
Built by Ubuntu
Zend Engine v4.5.4, Copyright (c) Zend Technologies
    with Zend OPcache v8.5.4, Copyright (c), by Zend Technologies

$ sudo apt update
$ sudo apt --only-upgrade install php8.5-cli php8.5-fpm
$ $ php-fpm8.5 -v
PHP 8.5.4 (fpm-fcgi) (built: Oct 19 2026 14:35:18) (NTS)
Copyright (c) The PHP Group
Built by Ubuntu
Zend Engine v4.5.4, Copyright (c) Zend Technologies
    with Zend OPcache v8.5.4, Copyright (c), by Zend Technologies

$ sudo systemctl restart php8.5-fpm
$ sudo systemctl status php8.5-fpm --no-pager
[sudo: authenticate] Password:              
● php8.5-fpm.service - The PHP 8.5 FastCGI Process Manager
     Loaded: loaded (/usr/lib/systemd/system/php8.5-fpm.service; enabled; preset: enabled)
     Active: active (running) since Thu 2026-10-22 03:05:07 UTC; 1 day 2h ago
 Invocation: 33580ad4b2974d1d91855cd66ac5f7df
       Docs: man:php-fpm8.5(8)
   Main PID: 2023202 (php-fpm8.5)
     Status: "Processes active: 0, idle: 2, Requests: 576, slow: 0, Traffic: 0.00req/sec"
      Tasks: 3 (limit: 1807)
     Memory: 14.7M (peak: 84.2M, swap: 3.7M, swap peak: 3.7M)
        CPU: 6.500s
     CGroup: /system.slice/php8.5-fpm.service
             ├─2023202 "php-fpm: master process (/etc/php/8.5/fpm/php-fpm.conf)"
             ├─2023203 "php-fpm: pool www"
             └─2023204 "php-fpm: pool www"

Oct 22 03:05:07 mysite.com systemd[1]: Starting php8.5-fpm.service - The PHP 8.5 FastCGI Process Manager...
Oct 22 03:05:07 mysite.com systemd[1]: Started php8.5-fpm.service - The PHP 8.5 FastCGI Process Manager.

$ sudo systemctl is-enabled php8.5-fpm
enabled
$ sudo systemctl is-active php8.5-fpm
active
$ dpkg-query -W -f='${Version}\n' php8.5-fpm
8.5.4-0ubuntu1.5
```

`8.5.4-0ubuntu1.4` is upgraded to `8.5.4-0ubuntu1.5`.

`8.5.4-0ubuntu1.5` is safe, which is safe because it officially patches 
the critical "PHP2Shell" remote code execution vulnerabilities.

Ubuntu released this specific version for Ubuntu 26.04 LTS (Resolute) to address 
two severe security flaws assigned under CVE-2026-109618 and CVE-2026-109619.

Why this specific version is secure

- Patches Critical Vulnerabilities: This version addresses the critical state corruption and out-of-memory flaws (dubbed PHP2Shell). Left unpatched, these flaws allow unauthenticated attackers to execute malicious code remotely on web servers.
- Includes Backported Fixes: Even though upstream PHP fixed these bugs in version 8.5.12, Ubuntu uses a practice called "backporting." Instead of forcing a massive upgrade to a new upstream version (which could break your existing website configurations), Canonical applied the security patches directly to the stable 8.5.4 package base.
- Verified Ubuntu Security Release: The official changelog for 8.5.4-0ubuntu1.5 explicitly confirms the inclusion of CVE-2026-109618_109619 patch updates.

### Potential next step

Upgrade from 8.5.4 to 8.5.12, which is a version that fixed multiple security issues, with no new features. 
So it's more secure but won't break my current PHP websites.
