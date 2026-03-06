package com.storyngo.mappers;

import com.storyngo.dto.StoryDTO;
import com.storyngo.models.Story;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoryMapper {

    @Mapping(target = "authorName", source = "author.pseudo")
    @Mapping(target = "authorRole", source = "author.role")
    @Mapping(target = "authorProfileImageUrl", source = "author.profileImageUrl")
    @Mapping(target = "chapterCount", expression = "java(story.getChapters() == null ? 0 : story.getChapters().size())")
    StoryDTO toDto(Story story);
}

