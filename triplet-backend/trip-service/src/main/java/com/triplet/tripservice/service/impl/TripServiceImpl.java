package com.triplet.tripservice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.triplet.tripservice.client.GeminiClient;
import com.triplet.tripservice.dto.GeminiRequest;
import com.triplet.tripservice.dto.TripRequest;
import com.triplet.tripservice.dto.TripResponse;
import com.triplet.tripservice.entity.ChecklistEntity;
import com.triplet.tripservice.entity.ItineraryEntity;
import com.triplet.tripservice.entity.TripEntity;
import com.triplet.tripservice.mapper.TripMapper;
import com.triplet.tripservice.repository.ChecklistRepository;
import com.triplet.tripservice.repository.ItineraryRepository;
import com.triplet.tripservice.repository.TripRepository;
import com.triplet.tripservice.service.TripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class TripServiceImpl implements TripService {

    private final TripRepository repository;
    private final TripMapper mapper;
    private final ItineraryRepository itineraryRepository;
    private final ChecklistRepository checklistRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;




    @Override
    @Transactional
    public TripResponse createTrip(TripRequest request, String userId) {
        log.info("Yeni səyahət yaradılır. İstiqamət: {}, User: {}", request.getDestination(), userId);

        TripEntity trip = mapper.toEntity(request,userId);

        enrichTripWithAiData(trip);

        TripEntity saved = repository.save(trip);

        return mapper.toDto(saved);
    }

    @Override
    public Page<TripResponse> getUserTrips(String userId, Pageable pageable) {
        return repository.findAllByUserId(pageable,userId)
                .map(mapper::toDto);
    }


    @Override
    @Transactional
    public void deleteTrip(UUID tripId, String userId) {
        TripEntity trip = repository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Səyahət tapılmadı"));

        // İstifadəçinin öz səyahətini sildiyinə əmin oluruq
        if (!trip.getUserId().equals(userId)) {
            throw new RuntimeException("Bu səyahəti silməyə icazəniz yoxdur");
        }

        repository.delete(trip);
    }


    private void enrichTripWithAiData(TripEntity trip) {
        String destination = trip.getDestination();
        String startDate = trip.getStartDate() != null ? trip.getStartDate().toString() : "unknown";
        String endDate = trip.getEndDate() != null ? trip.getEndDate().toString() : "unknown";
        String budget = trip.getBudget() != null ? trip.getBudget().toString() : "unknown";


        String promptText = String.format("""
        Analyze this trip title: "%s". Dates: %s to %s. Budget: %s USD.
        
        TASK:
        1. Check if the title is a real city/location.
        2. If NOT a real location, treat it as a 'Personal Trip Name' and return an empty itineraries array.
        3. If YES, generate a realistic, well-paced itinerary with 5 to 7 distinct places to visit.
        4. Distribute these visits logically across the trip dates (%s to %s) and assign realistic visit times (e.g., "09:00", "14:30").
        5. Estimate REALISTIC total costs per place in USD (include entry fees, average transit to get there, and a quick snack/coffee). Do not underestimate; provide accurate tourist costs.
        
        Return ONLY a raw JSON object (no markdown, no backticks):
        {
          "is_location_valid": true or false,
          "advice": "If NOT a real location, write ONE SHORT, creative sentence (max 15 words) about this specific title '%s' and ask for a city name. If YES, give a short travel tip.",
          "checklist": ["Exactly 5 travel essentials"],
          "itineraries": [
            {
              "placeName": "Name of the location",
              "aiPlaceTip": "Short and engaging tip",
              "estimatedCost": 35.00,
              "visitDate": "YYYY-MM-DD",
              "visitTime": "HH:MM"
            }
          ]
        }
        """, destination, startDate, endDate, budget, startDate, endDate, destination);

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(promptText).build()))
                        .build()))
                .build();

        try {
            var response = geminiClient.getTravelSuggestion(apiKey, request);
            String jsonResponse = response.getCandidates().get(0).getContent().getParts().get(0).getText();

            // Təmizləyici (Bəzən Gemini ```json formatında qaytarır)
            jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();

            JsonNode rootNode = objectMapper.readTree(jsonResponse);

            // 1. General Advice
            trip.setAiGeneralAdvice(rootNode.get("advice").asText());

            // 2. Checklist (5 ədəd məntiqi əşya)
            List<ChecklistEntity> checklistEntities = new ArrayList<>();
            for (JsonNode itemNode : rootNode.get("checklist")) {
                ChecklistEntity item = ChecklistEntity.builder()
                        .itemName(itemNode.asText())
                        .isPacked(false)
                        .trip(trip)
                        .build();
                checklistEntities.add(item);
            }
            trip.setChecklists(checklistEntities);

            // 3. Itineraries (Gəzməli Yerlər - Yeni Format)
            boolean isValid = rootNode.get("is_location_valid").asBoolean();
            log.info("'{}' üçün yer adı valid-dirmi?: {}", destination, isValid);

            List<ItineraryEntity> itineraryEntities = new ArrayList<>();
            JsonNode itinerariesArray = rootNode.get("itineraries");

            if (isValid && itinerariesArray != null && itinerariesArray.isArray()) {
                for (JsonNode itNode : itinerariesArray) {

                    // Json-dan gələn dataları oxuyuruq
                    String pName = itNode.get("placeName").asText();
                    String pTip = itNode.get("aiPlaceTip").asText();
                    BigDecimal eCost = new BigDecimal(itNode.get("estimatedCost").asText());

                    // Tarix və Saat (Gələn format: YYYY-MM-DD və HH:MM)
                    String vDate = itNode.get("visitDate").asText();
                    String vTime = itNode.get("visitTime").asText();

                    ItineraryEntity itinerary = ItineraryEntity.builder()
                            .placeName(pName)
                            .aiPlaceTip(pTip)
                            .estimatedCost(eCost)



                            .visitDate(java.time.LocalDate.parse(vDate))
                            .visitTime(java.time.LocalTime.parse(vTime))

                            .trip(trip)
                            .build();

                    itineraryEntities.add(itinerary);
                }
            }
            trip.setItineraries(itineraryEntities);

        } catch (Exception e) {
            log.error("AI Error: ", e);
            trip.setAiGeneralAdvice("Our travel guide is currently adjusting the compass. Have a great trip!");
        }
    }
    @Override
    @Transactional
    public TripResponse updateBudget(UUID tripId, BigDecimal amountToAdd) {
        TripEntity trip = repository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Köhnə büdcənin üstünə yenisini gəlirik (Null check daxil olmaqla)
        BigDecimal currentBudget = trip.getBudget() != null ? trip.getBudget() : BigDecimal.ZERO;
        trip.setBudget(currentBudget.add(amountToAdd));

        TripEntity saved = repository.save(trip);
        return mapper.toDto(saved);
    }
    @Override
    public TripResponse getTripById(UUID tripId, String userId) {
        TripEntity trip = repository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Səyahət tapılmadı"));

        if (!trip.getUserId().equals(userId)) {
            throw new RuntimeException("Bu səyahətə baxmaq icazəniz yoxdur!");
        }
        return mapper.toDto(trip);
    }

    // ==============================================================
    // ITINERARY LOGIC
    // ==============================================================

    @Override
    @Transactional
    public TripResponse.ItineraryDto addItinerary(UUID tripId, TripResponse.ItineraryDto request, String userId) {
        TripEntity trip = repository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        ItineraryEntity itinerary = ItineraryEntity.builder()
                .placeName(request.getPlaceName())
                .visitDate(request.getVisitDate())
                .visitTime(request.getVisitTime())
                .estimatedCost(request.getEstimatedCost())
                .trip(trip)
                .build();

        ItineraryEntity saved = itineraryRepository.save(itinerary);

        // Manual mapping for DTO
        TripResponse.ItineraryDto dto = new TripResponse.ItineraryDto();
        dto.setId(saved.getId());
        dto.setPlaceName(saved.getPlaceName());
        dto.setVisitDate(saved.getVisitDate());
        dto.setVisitTime(saved.getVisitTime());
        dto.setEstimatedCost(saved.getEstimatedCost());
        return dto;
    }

    @Override
    @Transactional
    public void deleteItinerary(UUID tripId, UUID itineraryId, String userId) {
        TripEntity trip = repository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        itineraryRepository.deleteById(itineraryId);
    }

    // ==============================================================
    // CHECKLIST LOGIC
    // ==============================================================

    @Override
    @Transactional
    public TripResponse.ChecklistDto addChecklist(UUID tripId, TripResponse.ChecklistDto request, String userId) {
        TripEntity trip = repository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        ChecklistEntity checklist = ChecklistEntity.builder()
                .itemName(request.getItemName())
                .isPacked(false)
                .trip(trip)
                .build();

        ChecklistEntity saved = checklistRepository.save(checklist);

        TripResponse.ChecklistDto dto = new TripResponse.ChecklistDto();
        dto.setId(saved.getId());
        dto.setItemName(saved.getItemName());
        dto.setPacked(saved.isPacked());
        return dto;
    }

    @Override
    @Transactional
    public void deleteChecklist(UUID tripId, UUID checklistId, String userId) {
        TripEntity trip = repository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        checklistRepository.deleteById(checklistId);
    }

    @Override
    @Transactional
    public TripResponse.ChecklistDto toggleChecklist(UUID tripId, UUID checklistId, boolean isPacked, String userId) {
        TripEntity trip = repository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        ChecklistEntity checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        checklist.setPacked(isPacked);
        ChecklistEntity saved = checklistRepository.save(checklist);

        TripResponse.ChecklistDto dto = new TripResponse.ChecklistDto();
        dto.setId(saved.getId());
        dto.setItemName(saved.getItemName());
        dto.setPacked(saved.isPacked());
        return dto;
    }

    @Override
    public String getAiChatResponse(UUID tripId, String userMessage, String userId) {
        TripEntity trip = repository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // DAHA AĞILLI VƏ ELASTİK PROMPT
        String promptText = String.format("""
        You are a professional and versatile travel assistant. 
        CONTEXT:
        - Current trip title/destination in system: "%s"
        - Trip dates: %s to %s
        - Available budget: $%s
        
        USER QUESTION: "%s"
        
        INSTRUCTIONS:
        1. If the user asks about a specific country, city, or place (like France, Paris, etc.), ignore the system destination and provide the best travel advice for THAT specific place.
        2. Always be helpful and creative. If the system destination seems like a 'personal title' (e.g., "Huseynin tetili"), treat it as a trip name, not a location name.
        3. Keep the answer professional, short (max 4 sentences), and do not use markdown like stars or bold text.
        """,
                trip.getDestination(), trip.getStartDate(), trip.getEndDate(), trip.getBudget(), userMessage);

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(promptText).build()))
                        .build()))
                .build();

        try {
            var response = geminiClient.getTravelSuggestion(apiKey, request);
            return response.getCandidates().get(0).getContent().getParts().get(0).getText().trim();
        } catch (Exception e) {
            log.error("AI Chat Error: ", e);
            return "Connection lost with the orbital navigator. Please retry.";
        }
    }


}


