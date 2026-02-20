package com.triplet.tripservice.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String destination;

    private String startDate;
    private String endDate;

    @Column(columnDefinition = "TEXT")
    private String aiGeneralAdvice;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL,orphanRemoval = true)
    @Builder.Default
    private List<ChecklistEntity> checklists = new ArrayList<>();

    @OneToMany(mappedBy = "trip",cascade = CascadeType.ALL,orphanRemoval = true)
    @Builder.Default
    private List<ItineraryEntity> itineraries =new ArrayList<>();

    private String description;

    private BigDecimal budget;
}
