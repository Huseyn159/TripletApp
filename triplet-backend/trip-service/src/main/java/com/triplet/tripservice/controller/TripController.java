package com.triplet.tripservice.controller;

import com.triplet.tripservice.dto.TripRequest;
import com.triplet.tripservice.dto.TripResponse;
import com.triplet.tripservice.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;


    @PostMapping("/{tripId}/chat")
    public ResponseEntity<String> chatWithNavigator(
            @PathVariable("tripId") UUID tripId,
            @RequestBody String userMessage, // Front-end-dən gələn sual
            @RequestHeader("X-User-Id") String userId) {

        return ResponseEntity.ok(tripService.getAiChatResponse(tripId, userMessage, userId));
    }
    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripRequest tripRequest,
                                                   @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(tripRequest,userId));
    }

    @GetMapping
    public ResponseEntity<Page<TripResponse>> getTrips(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok().body(tripService.getUserTrips(userId, pageable));
    }
    @PutMapping("/{tripId}/budget")
    public ResponseEntity<TripResponse> updateBudget(
            @PathVariable UUID tripId,
            @RequestParam BigDecimal amount,
            @RequestHeader("X-User-Id") String userId) {
        // amount mənfi (-) gələrsə çıxacaq, müsbət (+) gələrsə toplayacaq
        return ResponseEntity.ok(tripService.updateBudget(tripId, amount));
    }

    // 🚀 BAX BU METOD ÇATIŞMADIĞI ÜÇÜN 405 XƏTASI ALIRSINI!
    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable("tripId") UUID tripId,
                                                    @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(tripService.getTripById(tripId, userId));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable("tripId") UUID tripId, @RequestHeader("X-User-Id") String userId) {
        tripService.deleteTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{tripId}/itineraries")
    public ResponseEntity<TripResponse.ItineraryDto> addItinerary(
            @PathVariable("tripId") UUID tripId,
            @RequestBody TripResponse.ItineraryDto request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(tripService.addItinerary(tripId, request, userId));
    }

    @DeleteMapping("/{tripId}/itineraries/{itineraryId}")
    public ResponseEntity<Void> deleteItinerary(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("itineraryId") UUID itineraryId,
            @RequestHeader("X-User-Id") String userId) {
        tripService.deleteItinerary(tripId, itineraryId, userId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{tripId}/checklists")
    public ResponseEntity<TripResponse.ChecklistDto> addChecklist(
            @PathVariable("tripId") UUID tripId,
            @RequestBody TripResponse.ChecklistDto request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(tripService.addChecklist(tripId, request, userId));
    }

    @DeleteMapping("/{tripId}/checklists/{checklistId}")
    public ResponseEntity<Void> deleteChecklist(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("checklistId") UUID checklistId,
            @RequestHeader("X-User-Id") String userId) {
        tripService.deleteChecklist(tripId, checklistId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{tripId}/checklists/{checklistId}")
    public ResponseEntity<TripResponse.ChecklistDto> toggleChecklist(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("checklistId") UUID checklistId,
            @RequestBody TripResponse.ChecklistDto request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(tripService.toggleChecklist(tripId, checklistId, request.isPacked(), userId));
    }

}