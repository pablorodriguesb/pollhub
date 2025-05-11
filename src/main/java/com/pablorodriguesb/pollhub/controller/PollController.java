package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.*;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
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
    public ResponseEntity<PollResponseDTO> createPoll(
            @Valid @RequestBody PollDTO pollDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        // busca o usuario autenticado
        User creator = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));

        // converte PollDTO para entidade Poll
        Poll poll = new Poll();
        poll.setTitle(pollDTO.getTitle());
        poll.setDescription(pollDTO.getDescription());
        poll.setIsPublic(pollDTO.isPublic());
        poll.setCreatedBy(creator);
        poll.setCreatedAt(LocalDateTime.now());

        // converte opcoes do DTO para entidades
        List<Option> options = pollDTO.getOptions().stream()
                .map(optionDTO -> {
                    Option option = new Option();
                    option.setText(optionDTO.getText());
                    option.setPoll(poll); // define a relacao bidirecional
                    return option;
                })
                .collect(Collectors.toList());
        poll.setOptions(options);

        // salvando a enquete
        Poll savedPoll = pollService.createPoll(poll, creator);
        return ResponseEntity.ok(convertToDTO(savedPoll));
    }

    // lista todas enquetes publicas.
    @GetMapping("/public")
    public ResponseEntity<List<PollResponseDTO>> getPublicPolls() {
        List<Poll> polls = pollService.getPublicPolls();
        return ResponseEntity.ok(
                polls.stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList())
        );
    }


    // listar enquetes do usuario autenticado
    @GetMapping("/users/me/polls")
    public ResponseEntity<List<PollResponseDTO>> getMyPolls(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        List<Poll> polls = pollService.getPollsByUserWithDetails(currentUser);

        return ResponseEntity.ok(
                polls.stream()
                        .map(this::convertToDTO)  // metodo auxiliar
                        .collect(Collectors.toList())
        );
    }

    // lista todas enquetes criadas por um usuario.
    @GetMapping("/user/{username}")
    public ResponseEntity<List<PollResponseDTO>> getPollsByUser(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));

        List<Poll> polls = pollService.getPollsByUserWithDetails(user);

        return ResponseEntity.ok(
                polls.stream()
                        .map(this::convertToDTO)  // metodo auxiliar
                        .collect(Collectors.toList())
        );
    }


    // detalha uma enquete pelo Id.
    @GetMapping("/{id}")
    public ResponseEntity<PollResponseDTO> getPollById(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        Poll poll = pollService.getPollById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquete não encontrada"));

        // verificacao de seguranca para enquetes privadas
        if (!poll.getIsPublic()) {
            if (userDetails == null) {
                throw new AccessDeniedException("Acesso negado: autenticação necessária");
            }

            // verificar se o usuário logado é o criador
            User currentUser = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            if (!poll.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Acesso negado: você não é o criador desta enquete");
            }
        }

        // converter para dto usando o metodo auxiliar
        return ResponseEntity.ok(convertToDTO(poll));
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
                throw new AccessDeniedException(
                        "Acesso negado: autenticação necessária");
            }
            User currentUser = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Usuário não encontrado"));
            if (!poll.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException(
                        "Acesso negado: você não é o criador desta enquete");
            }
        }
        PollResultsDTO results = pollService.getResults(id);
        return ResponseEntity.ok(results);
    }

    private PollResponseDTO convertToDTO(Poll poll) {
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
                }).collect(Collectors.toList());
        dto.setOptions(optionDTOs);
        return dto;
    }
}