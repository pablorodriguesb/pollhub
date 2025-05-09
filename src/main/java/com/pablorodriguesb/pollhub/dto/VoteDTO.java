package com.pablorodriguesb.pollhub.dto;

import jakarta.validation.constraints.NotNull;

public class VoteDTO {

    @NotNull(message = "ID da opção é obrigatório")
    private Long optionId;
}
