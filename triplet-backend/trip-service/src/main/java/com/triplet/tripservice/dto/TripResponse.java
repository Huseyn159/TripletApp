package com.triplet.tripservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class TripResponse {
    private UUID id;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String aiGeneralAdvice;
    private BigDecimal budget;

    // Alt cədvəllərimiz üçün daxili DTO-lar
    private List<ChecklistDto> checklists;
    private List<ItineraryDto> itineraries;

    @Data
    public static class ChecklistDto {
        private UUID id;
        private String itemName;
        @JsonProperty("isPacked")
        private boolean isPacked;
    }

    @Data
    public static class ItineraryDto {
        private UUID id;
        private String placeName;
        private LocalDate visitDate;
        private LocalTime visitTime;
        private String aiPlaceTip;
        private BigDecimal estimatedCost;
    }
}