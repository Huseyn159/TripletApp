package com.triplet.auth.service;

import com.triplet.auth.dto.UserUpdateRequest;
import com.triplet.auth.entity.UserEntity;

public interface UserService {
    UserEntity getCurrentUser(String email);
    String updateAvatar(String email, String avatarUrl);
    UserEntity updateUser(String email, UserUpdateRequest request);
    void deleteUser(String email);
}