package com.pablorodriguesb.pollhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PollDTO {

    @NotBlank(message = "Títutlo é obrigatório")
    @Size(max = 120, message = "Título deve ter no máximo 120 caracteres")
    private String title;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @NotNull(message = "Campo isPublic é obrigatório")
    private Boolean isPublic;

    @NotNull(message = "Opções são obrigatórias")
    private List<OptionDTO> options;
}
