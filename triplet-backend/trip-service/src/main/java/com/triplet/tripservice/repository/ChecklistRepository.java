package com.triplet.tripservice.repository;

import com.triplet.tripservice.entity.ChecklistEntity;
import com.triplet.tripservice.entity.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChecklistRepository extends JpaRepository<ChecklistEntity, UUID> {
}
