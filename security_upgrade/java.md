# Security upgrade: Java

## 10/23/2026

### CVE-2026-91403: Java and OpenJDK Trust Fixes

https://www.penligent.ai/hackinglabs/cve-2026-91403/

### Fix

```
$ java --version
openjdk 25.0.4.1 2026-08-18
OpenJDK Runtime Environment (build 25.0.4.1+1-1-26.04.4-Ubuntu)
OpenJDK 64-Bit Server VM (build 25.0.4.1+1-1-26.04.4-Ubuntu, mixed mode, sharing)
$ sudo apt update
56 packages can be upgraded. Run 'apt list --upgradable' to see them.
$ sudo apt --only-upgrade install openjdk-25-jdk
openjdk-25-jdk is already the newest version (25.0.4.1+1-1~26.04.4).
Summary:                    
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 56
```

The fixed openjdk-25-jdk package version (25.0.5) is not yet available in the upstream Ubuntu "resolute" repositories, 
which is why apt tells you it is already at the newest version.

While you wait for the official Ubuntu security update to drop, you can mitigate CVE-2026-91403 immediately 
by manually disabling the compromised eMudhra root certificates directly within your current Java installation.

Immediate Mitigation: Manual Certificate Disablement

```
# Locate the cacerts file for OpenJDK 25
CACERTS_PATH="/usr/lib/jvm/java-25-openjdk-amd64/lib/security/cacerts"

# Remove the affected eMudhra root aliases
sudo keytool -delete -alias "emudhrarootcaigcv2" -keystore "$CACERTS_PATH" -storepass changeit
sudo keytool -delete -alias "emudhranqrootcag2" -keystore "$CACERTS_PATH" -storepass changeit
```

How to check if my cacerts contain emudhrarootcaigcv2?

```
$ keytool -list -cacerts -storepass changeit | grep -i emudhra
$
```

Since the command returned absolutely nothing except for the built-in warning, 
the eMudhra root certificates are not present in your OpenJDK 25 keystore.

Because your cacerts file does not contain these certificates, your web server is 
not vulnerable to CVE-2026-91403, despite running version 25.0.4.1. The Ubuntu 
security maintainers likely stripped or never included these specific root certificates 
in your environment's build package, keeping your runtime safe.

No manual deletion or immediate mitigations are required. You are safe to continue operating normally.

