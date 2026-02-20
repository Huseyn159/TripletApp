package com.triplet.auth.service;

public interface EmailService {

    void sendWelcomeEmail(String email, String name, String verifyLink);
    void sendLockoutEmail(String to, String name);
    void sendPasswordResetEmail(String to, String name, String resetLink);
}
