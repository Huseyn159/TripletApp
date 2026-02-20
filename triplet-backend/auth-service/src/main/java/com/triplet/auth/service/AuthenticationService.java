package com.triplet.auth.service;

import com.triplet.auth.dto.*;

public interface AuthenticationService {
    void verifyEmail(String token);
    void resetPassword(ResetPasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    AuthResponse refreshToken(String authHeader);
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
}
