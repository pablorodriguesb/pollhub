package com.pablorodriguesb.pollhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PollResponseDTO {
    private Long id;
    private String title;
    private String description;

    @JsonProperty("isPublic")
    private boolean publicFlag;

    private LocalDateTime createdAt;
    private String createdBy;
    private List<OptionDTO> options;
}
