package com.triplet.tripservice.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "checklists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @Column(nullable = false)
    private String itemName;

    @Builder.Default
    private boolean isPacked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id",nullable = false)
    private TripEntity trip;
}
