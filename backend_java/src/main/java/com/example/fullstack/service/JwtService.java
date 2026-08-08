package com.example.fullstack.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder encoder;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();
        long expiry = 3600L; // 1-hour expiration limit

        // 1. Explicitly build the JWS header using symmetric HMAC-SHA256
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        // 2. Build the target user payload claims
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiry))
                .subject(authentication.getName())
                .claim("scope", "USER")
                .build();

        // FIX: Pass BOTH the custom jwsHeader and claims into the encoder parameters
        return this.encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }
}
