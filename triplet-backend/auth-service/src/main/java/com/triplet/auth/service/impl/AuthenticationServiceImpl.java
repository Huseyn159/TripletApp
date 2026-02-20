package com.triplet.auth.service.impl;

import com.triplet.auth.dto.*;
import com.triplet.auth.entity.*;
import com.triplet.auth.repository.PasswordResetTokenRepository;
import com.triplet.auth.repository.UserRepository;
import com.triplet.auth.repository.VerificationTokenRepository;
import com.triplet.auth.service.AuthenticationService;
import com.triplet.auth.service.EmailService;
import com.triplet.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;



    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }

        var user = new UserEntity();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        user.setRole(Role.USER);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(false); // 🔥 HESAB DEAKTİV OLARAQ YARANIR

        repository.save(user);

        // verify token
        String token = java.util.UUID.randomUUID().toString();
        var verificationToken = VerificationTokenEntity.builder()
                .token(token)
                .user(user)
                .expiryDate(java.time.LocalDateTime.now().plusHours(24)) // 24 saat keçərlidir
                .build();
        verificationTokenRepository.save(verificationToken);

        // react ucun tesdiq linki
        String verifyLink = "http://localhost:5173/verify-email?token=" + token;

        // verfy email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), verifyLink);

        //jwt token email tesdiqlenenden sora yaranir burda
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .build();
    }

    public void verifyEmail(String token) {
        var verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token!"));

        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new RuntimeException("Token expired, please register again.");
        }

        var user = verificationToken.getUser();
        user.setEnabled(true); // <--- HESABI AKTİVLƏŞDİRİRİK
        repository.save(user);

        verificationTokenRepository.delete(verificationToken); // İstifadə olunmuş tokeni silirik
    }





    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // 1. Əvvəlcə istifadəçini tapırıq
        var user = repository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // 2. Hesabın bloklanıb-bloklanmadığını yoxlayırıq
        if (!user.isAccountNonLocked()) {
            throw new RuntimeException("Your account is locked!Please check your email and try again");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Please verify your account before login!");
        }

        // 3. Spring Security-yə "yoxla" deyirik və səhv olarsa xətanı TUTURUQ (catch)
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            // sifre sehvirse bura girir
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);

            // 5 dəfə səhv etdisə:
            if (attempts >= 5) {
                user.setAccountNonLocked(false);
                repository.save(user);
                emailService.sendLockoutEmail(user.getEmail(), user.getName()); // Emaili göndər
                throw new RuntimeException("5 uğursuz cəhd! Hesabınız təhlükəsizlik məqsədilə bloklandı və sizə email göndərildi.");
            }

            repository.save(user); // Sadəcə sayğacı artırıb bazaya yaz
            throw new RuntimeException("Səhv şifrə! Qalan cəhd sayınız: " + (5 - attempts));
        }

        // sifre duz
        // failed attempt sifirlanir
        user.setFailedAttempts(0);
        repository.save(user);

        // token yaradib qaytaririq
        var jwtToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        //password match test
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }


        //Token axtarmaq
        var resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(()-> new RuntimeException("Invalid token!"));


        //tokenin vaxti kecib ya yox
        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {

            //vaxt kecibse bazadan silib xeta atmaq
            resetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token expired,please request new token.");
        }

        //tokenin sahibi
        var user = resetToken.getUser();

        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("The new password cannot be the same as the old password!");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));

        //Eger hesab blokdadirsa,onu blokdan cixarmaq MENTIQI
        user.setAccountNonLocked(true);
        user.setFailedAttempts(0);

        repository.save(user);

        //istifade edilmis tokeni sil
        resetTokenRepository.delete(resetToken);

    }


    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        //Istifadecini tapmaq
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("User not found!"));

        //---SPAM YOXLAMA---
        var existingToken = resetTokenRepository.findByUser(user);

        for (var token : existingToken) {
            //son 2 deqiqe erzinde yaradilibsa

            var now = java.time.LocalDateTime.now();
            var expiry = token.getExpiryDate();

            //Aradakı fərqi DƏQİQƏ ilə hesablayırıq
            long minutesLeft = java.time.Duration.between(now, expiry).toMinutes();

            log.info("Hazırki vaxt: " + now);
            log.info("Tokenin bitmə vaxtı: " + expiry);
            log.info("Tokenin bitməyinə qalan dəqiqə: " + minutesLeft);

            if (minutesLeft >= 8) {
                throw new RuntimeException("Reset request already sent. Check your email or try again in 2 minutes.");
            }
        }
        resetTokenRepository.deleteAll(existingToken);

        //unikal token yaratmaq
        String token = java.util.UUID.randomUUID().toString();

        //Tokeni bazada saxlamaq ucun obyekt yaratmaq
        var resetToken = PasswordResetTokenEntity.builder()
                .token(token)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(10))
                .user(user)
                .build();

        //db save
        resetTokenRepository.save(resetToken);

        //link hazirlamaq
        // MƏNİM DÜZƏLİŞİM: 8080 əvəzinə 5173 (React) portuna yönləndiririk. Bu vacibdir!
        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        //Email gonderilir
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);

    }

    public AuthResponse refreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Refresh token tapılmadı");
        }

        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractEmail(refreshToken);

        if (userEmail != null) {
            var user = repository.findByEmail(userEmail).orElseThrow();

            // Tokenin vaxtının keçib-keçmədiyini yoxlayırıq
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateAccessToken(user);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken) // Köhnə refresh tokeni geri qaytara bilərik və ya yenisini yarada bilərik
                        .build();
            }
        }
        throw new RuntimeException("Refresh token etibarsızdır");
    }
}