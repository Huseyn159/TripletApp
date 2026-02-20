package com.triplet.auth.service.impl;

import com.triplet.auth.dto.UserUpdateRequest;
import com.triplet.auth.entity.UserEntity;
import com.triplet.auth.repository.UserRepository;
import com.triplet.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserEntity getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public String updateAvatar(String email, String avatarUrl) {
        UserEntity user = getCurrentUser(email);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        log.info("Avatar updated for user: {}", email);
        return "Avatar updated successfully";
    }

    @Override
    public UserEntity updateUser(String email, UserUpdateRequest request) {
        UserEntity user = getCurrentUser(email);

        // Əgər adda dəyişiklik gəlibsə, yenilə
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        log.info("Profile updated for user: {}", email);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String email) {
        UserEntity user = getCurrentUser(email);
        userRepository.delete(user);
        log.info("User deleted from system: {}", email);
    }
}