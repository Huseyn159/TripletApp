package com.triplet.auth.controller;

import com.triplet.auth.dto.UserUpdateRequest;
import com.triplet.auth.entity.UserEntity;
import com.triplet.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;


    @GetMapping("/me")
    public ResponseEntity<UserEntity> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }


    @PutMapping("/avatar")
    public ResponseEntity<String> updateAvatar(@RequestBody String avatarUrl, Authentication authentication) {
        return ResponseEntity.ok(userService.updateAvatar(authentication.getName(), avatarUrl));
    }


    @PutMapping("/me")
    public ResponseEntity<UserEntity> updateUser(@RequestBody UserUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(userService.updateUser(authentication.getName(), request));
    }


    @DeleteMapping("/me")
    public ResponseEntity<String> deleteUser(Authentication authentication) {
        userService.deleteUser(authentication.getName());
        return ResponseEntity.ok("User account deleted successfully.");
    }
}