package com.pablorodriguesb.pollhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OptionDTO {

    @NotBlank(message = "Texto da opção é obrigatório")
    @Size(max = 200, message = "Texto da opção deve ter no" +
            "máximo 200 caracteres")
    private String text;
}
