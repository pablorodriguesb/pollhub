package com.pablorodriguesb.pollhub.dto;

import lombok.Data;

@Data
public class OptionResultDTO {
    private Long optionId;
    private String text;
    private int votes;
}
