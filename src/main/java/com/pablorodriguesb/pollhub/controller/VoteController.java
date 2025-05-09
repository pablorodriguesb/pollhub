package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import com.pablorodriguesb.pollhub.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;
    private final UserService userService;
    private final PollService pollService;

    @Autowired
    public VoteController(VoteService voteService, UserService userService,
                          PollService pollService) {
        this.voteService = voteService;
        this.userService = userService;
        this.pollService = pollService;
    }

    // endpoint para votar em uma enquete.
    @PostMapping
    public ResponseEntity<Vote> vote(
            @RequestParam String username,
            @RequestParam Long pollId,
            @Valid @RequestBody Vote vote) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        Poll poll = pollService.getPollById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Enquete não encontrada"));
        Vote createdVote = voteService.vote(user, poll, vote);
        return ResponseEntity.ok(createdVote);
    }

    // listar todos os votos de uma enquete.
    @GetMapping("/poll/{pollId}")
    public ResponseEntity<List<Vote>> getVotesByPoll(@PathVariable Long pollId) {
        Poll poll = pollService.getPollById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Enquete não encontrada"));
        return ResponseEntity.ok(voteService.getVotesByPoll(poll));
    }

    // listar todos os votos de um usuario.
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Vote>> getVotesByUser(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return ResponseEntity.ok(voteService.getVotesByUser(user));
    }
}
