package com.pablorodriguesb.pollhub.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VoteResponseDTO {
    private Long pollId;
    private String pollTitle;
    private Long optionId;
    private String optionText;
    private LocalDateTime votedAt;
}
