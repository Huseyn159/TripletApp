package com.triplet.auth.service.impl;

import com.triplet.auth.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private final String FROM_EMAIL = "komik958@gmail.com";
    private final String FRONTEND_URL = "http://localhost:5173"; // Gələcəkdə canlı domain bura yazılacaq

    @Async
    @Override
    public void sendWelcomeEmail(String to, String name, String verifyLink) { // verifyLink əlavə edildi
        try {
            Context context = new Context();
            context.setVariable("name", name);

            context.setVariable("verifyLink", verifyLink);

            String processHtml = templateEngine.process("welcome-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject("Verify your Triplet Account! ✈️🌍");
            helper.setText(processHtml, true);

            mailSender.send(mimeMessage);
            log.info("Verification email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Error sending verification email: {}", e.getMessage());
        }
    }

    @Async
    @Override
    public void sendLockoutEmail(String to, String name) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            // forgot password sehifesi
            context.setVariable("unlockLink", FRONTEND_URL + "/forgot-password");

            String processHtml = templateEngine.process("lockout-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject("SECURITY ALERT: Your account has been locked! ⚠️"); //
            helper.setText(processHtml, true);

            mailSender.send(mimeMessage);
            log.info("Lockout HTML email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Error sending lockout HTML email: {}", e.getMessage());
        }
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("resetLink", resetLink);

            String processHtml = templateEngine.process("reset-password", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject("🔑 Password Reset Request"); // İngiliscə başlıq
            helper.setText(processHtml, true);

            mailSender.send(mimeMessage);
            log.info("Password reset email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage());
        }
    }
}