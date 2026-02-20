package com.triplet.tripservice.client;


import com.triplet.tripservice.dto.GeminiRequest;
import com.triplet.tripservice.dto.GeminiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "geminiClient", url= "${gemini.api.url}")
public interface GeminiClient {

    @PostMapping("/v1beta/models/gemini-2.5-flash:generateContent")
    GeminiResponse getTravelSuggestion(
            @RequestParam("key") String apiKey,
            @RequestBody GeminiRequest request
    );
}
