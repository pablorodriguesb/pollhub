package com.pablorodriguesb.pollhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OptionDTO {

    private Long id;

    @NotBlank(message = "Texto da opção é obrigatório")
    @Size(max = 200, message = "Texto da opção deve ter no" +
            "máximo 200 caracteres")
    private String text;
}
