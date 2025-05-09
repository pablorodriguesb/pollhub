package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VoteService {

    private final VoteRepository voteRepository;

    @Autowired
    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    /* registra o voto de um usuario em uma enquete, com persistencia
    de votar apenas uma vez */
    public Vote vote(User user, Poll poll, Vote vote)  {
        Optional<Vote> existingVote = voteRepository.findByUserAndPoll(user, poll);
        if (existingVote.isPresent()) {
            throw new IllegalStateException("Usuário já votou nessa enquete.");
        }
        vote.setVotedAt(LocalDateTime.now());
        return voteRepository.save(vote);
    }

    // retorna todos os votos de uma enquete.
    public List<Vote> getVotesByPoll(Poll poll) {
        return voteRepository.findByPoll(poll);
    }

    // retorna todos os votos de um usuario.
    public List<Vote> getVotesByUser(User user) {
        return voteRepository.findByUser(user);
    }
}
