package com.triplet.tripservice.repository;

import com.triplet.tripservice.entity.ItineraryEntity;
import com.triplet.tripservice.entity.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<ItineraryEntity, UUID> {
}
