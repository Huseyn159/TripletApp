package com.triplet.auth.repository;

import com.triplet.auth.entity.PasswordResetTokenEntity;
import com.triplet.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, UUID> {

    // Gələn linkdəki tokenə əsasən cədvəldən o sətri tapmaq üçün:
    Optional<PasswordResetTokenEntity> findByToken(String token);
    List<PasswordResetTokenEntity> findByUser(UserEntity user);

}
