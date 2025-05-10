package com.pablorodriguesb.pollhub.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PollResponseDTO {
    private Long id;
    private String title;
    private String description;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<OptionDTO> options;
}
