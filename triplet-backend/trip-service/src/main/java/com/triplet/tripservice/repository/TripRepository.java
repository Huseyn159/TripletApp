package com.triplet.tripservice.repository;

import com.triplet.tripservice.entity.TripEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, UUID> {
       Page<TripEntity> findAllByUserId(Pageable pageable, String userId);
}
