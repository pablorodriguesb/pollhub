package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.OptionDTO;
import com.pablorodriguesb.pollhub.dto.PollDTO;
import com.pablorodriguesb.pollhub.dto.PollResponseDTO;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<Poll>> getPublicPolls() {
        return ResponseEntity.ok(pollService.getPublicPolls());
    }

    // lista todas enquetes criadas por um usuario.
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Poll>> getPollsByUser(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return ResponseEntity.ok(pollService.getPollsByUser(user));
    }

    // detalha uma enquete pelo Id.
    @GetMapping("/{id}")
    public ResponseEntity<Poll> getPollById(@PathVariable Long id) {
        return pollService.getPollById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
