package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.VoteResponseDTO;
import com.pablorodriguesb.pollhub.exception.BadRequestException;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import com.pablorodriguesb.pollhub.service.VoteService;
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
    public VoteController(VoteService voteService,
                          UserService userService,
                          PollService pollService) {
        this.voteService = voteService;
        this.userService = userService;
        this.pollService = pollService;
    }

    // listar todos os votos de uma enquete.
    @GetMapping("/poll/{pollId}")
    public ResponseEntity<List<VoteResponseDTO>> getVotesByPoll(
            @PathVariable Long pollId) {
        try {
            List<VoteResponseDTO> votes = voteService.getVotesByPoll(pollId);
            if (votes == null || votes.isEmpty()) {
                throw new BadRequestException("Nenhum voto encontrado"
                        + "para esta enquete.");
            }
            return ResponseEntity.ok(votes);
        }  catch (ResourceNotFoundException ex) {
            throw new BadRequestException("Enquete não encontrada.");
        }
    }
}
