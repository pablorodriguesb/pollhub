package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.*;
import com.pablorodriguesb.pollhub.exception.AcessDeniedException;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    private final PollService pollService;
    private final UserService userService;

    @Autowired
    public PollController(PollService pollService, UserService userService) {
        this.pollService = pollService;
        this.userService = userService;
    }

    // cria uma nova enquete.
    @PostMapping
    public ResponseEntity<PollResponseDTO> createPoll(@Valid @RequestBody PollDTO pollDTO,
                                                      @RequestParam String username) {
        // convertendo polldto para entidade poll
        Poll poll = new Poll();
        poll.setTitle(pollDTO.getTitle());
        poll.setDescription(pollDTO.getDescription());
        poll.setIsPublic(pollDTO.isPublic());

        // vincular opcoes a poll
        List<Option> options = pollDTO.getOptions().stream()
                .map(optionDTO -> {
                    Option option = new Option();
                    option.setText(optionDTO.getText());
                    option.setPoll(poll);
                    return option;
                })
                .collect(Collectors.toList());
        poll.setOptions(options);

        // buscar criador
        User creator = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        // salvando
        Poll savedPoll = pollService.createPoll(poll, creator);

        // converter para PollResponseDTO
        PollResponseDTO responseDTO = new PollResponseDTO();
        responseDTO.setId(savedPoll.getId());
        responseDTO.setTitle(savedPoll.getTitle());
        responseDTO.setDescription(savedPoll.getDescription());
        responseDTO.setPublic(savedPoll.getIsPublic());
        responseDTO.setCreatedAt(savedPoll.getCreatedAt());
        responseDTO.setCreatedBy(savedPoll.getCreatedBy().getUsername());

        // converter opcoes para optionDTO
        List<OptionDTO> optionDTOs = savedPoll.getOptions().stream()
                .map(option -> {
                    OptionDTO dto = new OptionDTO();
                    dto.setId(option.getId());
                    dto.setText(option.getText());
                    return dto;
                })
                .collect(Collectors.toList());
        responseDTO.setOptions(optionDTOs);

        return ResponseEntity.ok(responseDTO);
    }

    // lista todas enquetes publicas.
    @GetMapping("/public")
    public ResponseEntity<List<PollResponseDTO>> getPublicPolls() {
        List<Poll> polls = pollService.getPublicPolls();
        List<PollResponseDTO> dtos = polls.stream()
                .map(poll -> {
                    PollResponseDTO dto = new PollResponseDTO();
                    dto.setId(poll.getId());
                    dto.setTitle(poll.getTitle());
                    dto.setDescription(poll.getDescription());
                    dto.setPublic(poll.getIsPublic());
                    dto.setCreatedAt(poll.getCreatedAt());
                    dto.setCreatedBy(poll.getCreatedBy().getUsername());

                    // converta as opcoes para optionDTO se necessario
                    List<OptionDTO> optionDTOs = poll.getOptions().stream()
                            .map(option -> {
                                OptionDTO optionDTO = new OptionDTO();
                                optionDTO.setId(option.getId());
                                optionDTO.setText(option.getText());
                                return optionDTO;
                            })
                            .collect(Collectors.toList());
                    dto.setOptions(optionDTOs);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // listar enquetes do usuario autenticado
    @GetMapping("/me/polls")
    public ResponseEntity<List<PollResponseDTO>> getMyPolls(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));

        List<Poll> polls = pollService.getPollsByUser(currentUser);
        List<PollResponseDTO> dtos = convertPollsToDTOs(polls);

        return ResponseEntity.ok(dtos);
    }

    private List<PollResponseDTO> convertPollsToDTOs(List<Poll> polls) {
        return polls.stream()
                .map(poll -> {
                    PollResponseDTO dto = new PollResponseDTO();
                    dto.setId(poll.getId());
                    dto.setTitle(poll.getTitle());
                    dto.setDescription(poll.getDescription());
                    dto.setPublic(poll.getIsPublic());
                    dto.setCreatedAt(poll.getCreatedAt());
                    dto.setCreatedBy(poll.getCreatedBy().getUsername());

                    List<OptionDTO> optionDTOS = poll.getOptions().stream()
                            .map(option -> {
                                OptionDTO optionDTO = new OptionDTO();
                                optionDTO.setId(option.getId());
                                optionDTO.setText(option.getText());
                                return optionDTO;
                            })
                            .collect(Collectors.toList());
                    dto.setOptions(optionDTOS);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    // lista todas enquetes criadas por um usuario.
    @GetMapping("/user/{username}")
    public ResponseEntity<List<PollResponseDTO>> getPollsByUser(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        List<Poll> polls = pollService.getPollsByUser(user);

        // converter para lista de DTOs
        List<PollResponseDTO> pollDTOs = polls.stream()
                .map(poll -> {
                    PollResponseDTO dto = new PollResponseDTO();
                    dto.setId(poll.getId());
                    dto.setTitle(poll.getTitle());
                    dto.setDescription(poll.getDescription());
                    dto.setPublic(poll.getIsPublic());
                    dto.setCreatedAt(poll.getCreatedAt());
                    dto.setCreatedBy(poll.getCreatedBy().getUsername());

                    // converter opcoes
                    List<OptionDTO> optionDTOs = poll.getOptions().stream()
                            .map(option -> {
                                OptionDTO optionDTO = new OptionDTO();
                                optionDTO.setId(option.getId());
                                optionDTO.setText(option.getText());
                                return optionDTO;
                            })
                            .collect(Collectors.toList());
                    dto.setOptions(optionDTOs);

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(pollDTOs);
    }

    // detalha uma enquete pelo Id.
    @GetMapping("/{id}")
    public ResponseEntity<PollResponseDTO> getPollById(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        Poll poll = pollService.getPollById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enquete não encontrada"));

        // verificacao de seguranca para enquetes privadas
        if (!poll.getIsPublic()) {
            // Se não há usuário autenticado
            if (userDetails == null) {
                throw new AccessDeniedException("Acesso negado: autenticação necessária");
            }

            // Verificar se o usuário logado é o criador
            User currentUser = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            if (!poll.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Acesso negado: você não é o criador desta enquete");
            }
        }

        // converter para dto
        PollResponseDTO dto = new PollResponseDTO();
        dto.setId(poll.getId());
        dto.setTitle(poll.getTitle());
        dto.setDescription(poll.getDescription());
        dto.setPublic(poll.getIsPublic());
        dto.setCreatedAt(poll.getCreatedAt());
        dto.setCreatedBy(poll.getCreatedBy().getUsername());

        List<OptionDTO> optionDTOs = poll.getOptions().stream()
                .map(option -> {
                    OptionDTO optionDTO = new OptionDTO();
                    optionDTO.setId(option.getId());
                    optionDTO.setText(option.getText());
                    return optionDTO;
                })
                .collect(Collectors.toList());
        dto.setOptions(optionDTOs);

        return ResponseEntity.ok(dto);
    }

    // votar em uma enquete.
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(
            @PathVariable Long id,
            @Valid @RequestBody VoteDTO voteDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        User voter = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));

        pollService.vote(id, voteDTO.getOptionId(), voter);
        return ResponseEntity.ok().build();
    }

    // logica de privacidade da enquete
    @GetMapping("/{id}/results")
    public ResponseEntity<PollResultsDTO> getResults(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Poll poll = pollService.getPollById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquete" +
                        "não encontrada"));

        // se a enquete for privada, so o criador pode ver os resultados
        if (!poll.getIsPublic()) {
            if (userDetails == null) {
                throw new AcessDeniedException(
                        "Acesso negado: autenticação necessária");
            }
            User currentUser = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Usuário não encontrado"));
            if (!poll.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AcessDeniedException(
                        "Acesso negado: você não é o criador desta enquete");
            }
        }
        PollResultsDTO results = pollService.getResults(id);
        return ResponseEntity.ok(results);
    }
}