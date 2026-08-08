package com.example.fullstack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.oauth2.jwt.Jwt;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;

import java.nio.charset.StandardCharsets;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {

    @Value("${jwt.secret-key}")
    private String jwtSecretKey;

    // @Bean
    // public SecurityFilterChain securityFilterChain(HttpSecurity http) throws
    // Exception {
    // http
    // .authorizeHttpRequests(auth -> auth
    // .requestMatchers("/login", "/css/**").permitAll() // Public routes
    // .anyRequest().authenticated() // Protect everything else
    // )
    // .formLogin(form -> form
    // .loginPage("/api/auth/login") // Custom login page URL
    // .defaultSuccessUrl("/dashboard", true) // Redirect after successful login
    // .permitAll()
    // )
    // .logout(logout -> logout
    // .logoutUrl("/logout")
    // .logoutSuccessUrl("/api/auth/login?logout") // Redirect after logging out
    // .permitAll()
    // );

    // return http.build();
    // }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails user = User.builder()
                .username("user")
                .password(passwordEncoder.encode("")) // Hashes the password securely
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(user);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Enable CORS
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // Allow
                                                                                                         // preflights
                        .requestMatchers("/api/auth/login", "/css/**").permitAll()
                        .requestMatchers("/api/users").hasAuthority("SCOPE_USER")
                        .requestMatchers("/api/health").hasAuthority("SCOPE_USER")
                        .anyRequest().authenticated())
                // CRUCIAL: Replace default 302 redirect with a clean 401 JSON/API error
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // CRUCIAL: Tells Spring to look for 'Authorization: Bearer <token>'
                // automatically
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));
        ;

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = jwtSecretKey.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        // Tells Spring to only validate expiration timestamps, bypassing the "self"
        // domain issue
        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator());
        decoder.setJwtValidator(validator);

        return decoder;
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        OctetSequenceKey key = new OctetSequenceKey.Builder(jwtSecretKey.getBytes())
                .algorithm(com.nimbusds.jose.JWSAlgorithm.HS256)
                .build();
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties corsProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        // configuration.setAllowedOrigins(List.of(
        // "http://localhost:5173",
        // "https://spring.mtvs.space",
        // "https://spring.mountainviews.space")
        // ); // Allow Vue app
        // configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE",
        // "OPTIONS"));
        // configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        configuration.setAllowedOrigins(
                corsProperties.getAllowedOrigins());

        configuration.setAllowedMethods(
                corsProperties.getAllowedMethods());

        configuration.setAllowedHeaders(
                corsProperties.getAllowedHeaders());

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(
                corsProperties.getMaxAge());

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
