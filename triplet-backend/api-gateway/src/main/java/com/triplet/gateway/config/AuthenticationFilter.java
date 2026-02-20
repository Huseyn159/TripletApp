package com.triplet.gateway.config;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        super(Config.class);
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            // Əgər path qorunmalıdırsa
            if (validator.isSecured.test(exchange.getRequest())) {

                // 1. Header yoxlanılır
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    // 2. Token yoxlaması
                    jwtUtil.validateToken(authHeader);

                    // 3. ID-ni TƏHLÜKƏSİZ çıxarmaq (String, Integer və ya UUID olmasından asılı olmayaraq)
                    Object idObj = jwtUtil.getClaims(authHeader).get("id");
                    if (idObj == null) {
                        throw new RuntimeException("Token içində 'id' tapılmadı!");
                    }
                    String userId = String.valueOf(idObj); // Hər şeyi düzgün String-ə çevirəcək

                    // 4. Yeni sorğunu yaradıb, Header-i əlavə edirik
                    ServerHttpRequest request = exchange.getRequest()
                            .mutate()
                            .header("X-User-Id", userId)
                            .build();

                    // 5. Yeni sorğunu chain ötürürük
                    return chain.filter(exchange.mutate().request(request).build());

                } catch (Exception e) {
                    // Xətanı konsola yazdırırıq ki, gələcəkdə qaranlıqda qalmayaq
                    log.error("Gateway Token Xətası: {}", e.getMessage());

                    // Xəta olanda 500 çöküşü yox, səliqəli 401 Unauthorized qaytarırıq
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }

            // Yol qorunmursa, birbaşa burax
            return chain.filter(exchange);
        };
    }

    public static class Config {}
}