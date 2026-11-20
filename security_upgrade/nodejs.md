# Security Upgrades: Node.js

## 10/22/2026

### 10 security issues

https://nodejs.org/en/blog/vulnerability/october-2026-security-releases

Basically, on mysite.com:
- /usr/bin/node is v22.22.1
- Previously installed v24.18.0 to fix the previous security issue and was running that
- Now need to upgrade to v24.18.0

### Upgrade node.js to fix security vulnerability

#### Install latest version node.js

```    
$ node -v
v22.22.1
$ nvm ls
       v24.18.0
$ which node
/usr/bin/node
$ /usr/bin/node -v
v22.22.1

$ nvm use v24.18.0
Now using node v24.18.0 (npm v11.16.0)
user@mysite:~$ which node
/home/user/.nvm/versions/node/v24.18.0/bin/node
$ node -v
v24.18.0
 
$ nvm install 'lts/*' --reinstall-packages-from=current
Downloading and installing node v24.22.1...
$ nvm alias default 'lts/*'
default -> lts/* (-> v24.22.1)
$ node -v 
v24.22.1

~$ nvm ls
       v24.18.0
->     v24.22.1
         system (-> v22.22.1)
default -> lts/* (-> v24.22.1)
iojs -> N/A (default)
unstable -> N/A (default)
node -> stable (-> v24.22.1) (default)
stable -> 24.22 (-> v24.22.1) (default)
lts/* -> lts/krypton (-> v24.22.1)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.17.0 (-> N/A)
lts/dubnium -> v10.24.1 (-> N/A)
lts/erbium -> v12.22.12 (-> N/A)
lts/fermium -> v14.21.3 (-> N/A)
lts/gallium -> v16.20.2 (-> N/A)
lts/hydrogen -> v18.20.8 (-> N/A)
lts/iron -> v20.20.2 (-> N/A)
lts/jod -> v22.23.4 (-> N/A)
lts/krypton -> v24.22.1
```

#### Link system node and npm to latest version:

```
$ sudo mv /usr/bin/node /usr/bin/node.old
$ sudo ln -s /home/user/.nvm/versions/node/v24.22.1/bin/node /usr/bin/node
$ /usr/bin/npm -v
9.2.0
$ npm -v
11.19.1
$ which npm
/home/user/.nvm/versions/node/v24.22.1/bin/npm
$ sudo mv /usr/bin/npm /usr/bin/npm.old
$ sudo ln -s /home/user/.nvm/versions/node/v24.22.1/bin/npm /usr/bin/npm

$ which node
/home/user/.nvm/versions/node/v24.22.1/bin/node
$ which npm
/home/user/.nvm/versions/node/v24.22.1/bin/npm
$ node -v
v24.22.1
$ npm -v
11.19.1
```

#### Then update node.js site and node.js BFF sites:

$ sudo vi /etc/systemd/system/todo-app.service

```
[Unit]
Description=Next.js Application
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/var/www/nodejs/ToDo_App/todo-app

Environment=NODE_ENV=production
Environment=PORT=3000
Environment=AUTH_TRUST_HOST=true
Environment=AUTH_URL=https://todo.mysite.com

ExecStart=/usr/bin/npm start
# ExecStart=/home/user/.nvm/versions/node/v24.18.0/bin/npm start # replace this by the above line.

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Make similar changes
```
$ sudo systemctl restart spring-nextjs-app
$ sudo systemctl restart go-nextjs-app
$ sudo systemctl restart rust-nextjs-app
```

Then reload and restart these services:
```
$ sudo systemctl daemon-reload

$ sudo systemctl restart todo-app
$ sudo systemctl restart spring-nextjs-app
$ sudo systemctl restart go-nextjs-app
$ sudo systemctl restart rust-nextjs-app
```

Then check and verify:
```
$ sudo systemctl status todo-app

● todo-app.service - Next.js Application
     Loaded: loaded (/etc/systemd/system/todo-app.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-10-23 04:35:58 UTC; 14min ago
 Invocation: 037ba3dd79124f268e9d9da8141976a7
   Main PID: 2059084 (npm start)
      Tasks: 24 (limit: 1807)
     Memory: 120.9M (peak: 135.2M)
        CPU: 827ms
     CGroup: /system.slice/todo-app.service
             ├─2059084 "npm start"
             ├─2059099 sh -c "next start -H 127.0.0.1 -p 3000"
             └─2059100 "next-server (v16.3.3)"

Oct 23 04:35:58 mysite.com systemd[1]: Started todo-app.service - Next.js Application.
Oct 23 04:35:58 mysite.com npm[2059084]: > todp-app@0.1.0 start
Oct 23 04:35:58 mysite.com npm[2059084]: > next start -H 127.0.0.1 -p 3000
Oct 23 04:35:59 mysite.com npm[2059100]: ▲ Next.js 16.3.3
Oct 23 04:35:59 mysite.com npm[2059100]: - Local:         http://127.0.0.1:3000
Oct 23 04:35:59 mysite.com npm[2059100]: - Network:       http://127.0.0.1:3000
Oct 23 04:35:59 mysite.com npm[2059100]: ✓ Ready in 376ms
Oct 23 04:35:59 mysite.com npm[2059100]: ✓ Running next.config.ts took 120ms

// 2059100 comes from line 138 above: └─2059100 "next-server (v16.3.3)" 
$ ls -l /proc/2059100/exe
lrwxrwxrwx 1 user user 0 Oct 23 04:35 /proc/2059100/exe -> /home/user/.nvm/versions/node/v24.22.1/bin/node
```

Do same for the 3 BFF services.

#### Remove the previous v24.18.0

```
$ ls /home/user/.nvm/versions/node/
v24.18.0  v24.22.1

$ nvm uninstall v24.18.0
$ ls /home/user/.nvm/versions/node/
v24.22.1

$ nvm ls
->     v24.22.1
         system (-> v24.22.1)
default -> 24 (-> v24.22.1)
iojs -> N/A (default)
unstable -> N/A (default)
node -> stable (-> v24.22.1) (default)
stable -> 24.22 (-> v24.22.1) (default)
lts/* -> lts/krypton (-> v24.22.1)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.17.0 (-> N/A)
lts/dubnium -> v10.24.1 (-> N/A)
lts/erbium -> v12.22.12 (-> N/A)
lts/fermium -> v14.21.3 (-> N/A)
lts/gallium -> v16.20.2 (-> N/A)
lts/hydrogen -> v18.20.8 (-> N/A)
lts/iron -> v20.20.2 (-> N/A)
lts/jod -> v22.23.4 (-> N/A)
lts/krypton -> v24.22.1
```
