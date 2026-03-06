package com.storyngo.mappers;

import com.storyngo.dto.AuthResponse;
import com.storyngo.dto.RegisterRequest;
import com.storyngo.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "profileImageUrl", ignore = true)
    @Mapping(target = "bannedPermanently", ignore = true)
    @Mapping(target = "bannedUntil", ignore = true)
    @Mapping(target = "banReason", ignore = true)
    User toUser(RegisterRequest request);

    @Mapping(target = "token", source = "token")
    AuthResponse toAuthResponse(User user, String token);
}
