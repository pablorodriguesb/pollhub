package com.pablorodriguesb.pollhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class PollResultDTO {
    private Long pollId;
    private String title;
    private String description;
    private List<OptionResultDTO> results;
}
