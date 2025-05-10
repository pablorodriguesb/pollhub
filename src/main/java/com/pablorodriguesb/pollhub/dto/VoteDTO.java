package com.pablorodriguesb.pollhub.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteDTO {

    @NotNull(message = "ID da enquete é obrigatório")
    private Long pollId;

    @NotNull(message = "ID da opção é obrigatório")
    private Long optionId;
}
