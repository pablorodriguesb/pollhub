package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Poll> createPoll(@Valid @RequestBody Poll poll,
                                           @RequestParam String username) {
        // busca usuario pelo username (adaptado para pegar do token jwt)
        User creator = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        Poll createdPoll = pollService.createPoll(poll, creator);
        return ResponseEntity.ok(createdPoll);
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
