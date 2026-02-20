package com.triplet.tripservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient // Bu servis özünü Eureka Server-də qeydiyyatdan keçirə bilsin deyə
@EnableFeignClients(basePackages = "com.triplet.tripservice.client")
public class TripServiceMain {

    public static void main(String[] args) {
        SpringApplication.run(TripServiceMain.class, args);
    }

}