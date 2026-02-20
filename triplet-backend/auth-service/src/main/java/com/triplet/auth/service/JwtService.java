package com.triplet.auth.service;

import com.triplet.auth.entity.UserEntity;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.function.Function;

public interface JwtService {
    String generateAccessToken(UserEntity user);
    String generateRefreshToken(UserEntity user);
    String extractEmail(String token);
    <T> T extractClaim(String token, Function<Claims, T> claimsResolver);
    boolean isTokenValid(String token, UserDetails userDetails);

}
