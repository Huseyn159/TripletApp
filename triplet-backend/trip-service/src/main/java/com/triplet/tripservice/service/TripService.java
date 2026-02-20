package com.triplet.tripservice.service;

import com.triplet.tripservice.dto.TripRequest;
import com.triplet.tripservice.dto.TripResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface TripService {
    TripResponse createTrip(TripRequest request, String userId);
    Page<TripResponse> getUserTrips(String userId, Pageable pageable);
    void deleteTrip(UUID tripId, String userId);

    TripResponse getTripById(UUID tripId, String userId);

    TripResponse.ItineraryDto addItinerary(UUID tripId, TripResponse.ItineraryDto request, String userId);
    void deleteItinerary(UUID tripId, UUID itineraryId, String userId);

    TripResponse.ChecklistDto addChecklist(UUID tripId, TripResponse.ChecklistDto request, String userId);
    void deleteChecklist(UUID tripId, UUID checklistId, String userId);
    TripResponse.ChecklistDto toggleChecklist(UUID tripId, UUID checklistId, boolean isPacked, String userId);

    String getAiChatResponse(UUID tripId, String userMessage, String userId);

    TripResponse updateBudget(UUID tripId, BigDecimal amountToAdd);

}
