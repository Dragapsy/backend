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
    User toUser(RegisterRequest request);

    @Mapping(target = "token", ignore = true)
    AuthResponse toAuthResponse(User user);
}
