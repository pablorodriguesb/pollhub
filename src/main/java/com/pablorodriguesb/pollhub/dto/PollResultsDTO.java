package com.pablorodriguesb.pollhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class PollResultsDTO {
    private Long pollId;
    private List<OptionResultDTO> results;
}
