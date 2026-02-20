package com.triplet.auth.service.impl;

import com.triplet.auth.entity.UserEntity;
import com.triplet.auth.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}") // application.yml-ə əlavə edərsən: 604800000 (7 gün)
    private long refreshExpiration;



    // token yradilir
    @Override
    public String generateAccessToken(UserEntity user) {
        //her defe db-ye getmemek ucun claimler
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", user.getId());
        extraClaims.put("role", user.getRole());// Nə vaxt verilib? (İndi)

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))// Nə vaxt bitəcək?
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();// String halına salırıq

    }
    // mail oxunur
    @Override
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // token checklenir
    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        //hem email hem de vaxtin bitib bitmediyini yoxlayir
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    @Override
    public String generateRefreshToken(UserEntity user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }



    // Bu metod biletin möhürünü yoxlayır və içindəki məlumatları "Claims" obyektinə çevirir
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Bizim açarımızla uyğun gəlirmi?
                .build()
                .parseClaimsJws(token) // Tokeni parse edir (açır)
                .getBody();
    }

    @Override
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // String olan "secretKey"-i byte-lara çevirib sistemin başa düşəcəyi "Key" obyektinə salır
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }



}
