package com.storyngo.mappers;

import com.storyngo.dto.ChapterDTO;
import com.storyngo.models.Chapter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChapterMapper {

    @Mapping(target = "authorName", expression = "java(resolveAuthorName(chapter))")
    @Mapping(target = "threshold", source = "chapter.voteThreshold")
    @Mapping(target = "voteCount", source = "voteCount")
    @Mapping(target = "isUnlocked", source = "isUnlocked")
    @Mapping(target = "votedByMe", source = "votedByMe")
    @Mapping(target = "votingClosed", source = "chapter.votingClosed")
    ChapterDTO toDto(Chapter chapter, long voteCount, boolean isUnlocked, boolean votedByMe);

    default String resolveAuthorName(Chapter chapter) {
        if (Boolean.TRUE.equals(chapter.getIsAnonymous())) {
            return "Anonyme";
        }
        if (chapter.getStory() == null || chapter.getStory().getAuthor() == null) {
            return null;
        }
        return chapter.getStory().getAuthor().getPseudo();
    }
}

