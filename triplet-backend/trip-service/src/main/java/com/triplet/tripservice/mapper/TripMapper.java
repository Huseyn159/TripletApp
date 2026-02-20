package com.triplet.tripservice.mapper;


import com.triplet.tripservice.dto.TripRequest;
import com.triplet.tripservice.dto.TripResponse;
import com.triplet.tripservice.entity.TripEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TripMapper {

    @Mapping(target = "aiGeneralAdvice", ignore = true)
    @Mapping(target = "checklists", ignore = true)
    @Mapping(target = "id",ignore = true)
    @Mapping(target = "userId",source = "userId")
    TripEntity toEntity(TripRequest request,String userId);

    TripResponse toDto(TripEntity tripEntity);
}
