package com.triplet.tripservice.dto;

import com.triplet.tripservice.entity.TripEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripRequest {

    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
}
