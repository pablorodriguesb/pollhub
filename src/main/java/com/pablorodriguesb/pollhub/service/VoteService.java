package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.VoteResponseDTO;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private final VoteRepository voteRepository;

    @Autowired
    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    // registra o voto de um usuario em uma enquete
    public Vote vote(User user, Poll poll, Vote vote)  {
        Optional<Vote> existingVote = voteRepository.findByUserAndPoll(user, poll);
        if (existingVote.isPresent()) {
            throw new IllegalStateException("Usuário já votou nessa enquete.");
        }
        vote.setVotedAt(LocalDateTime.now());
        return voteRepository.save(vote);
    }

    // retorna todos os votos de uma enquete.
    @Transactional(readOnly = true)
    public List<Vote> getVotesByPoll(Poll poll) {
        return voteRepository.findByPoll(poll);
    }

    // retorna todos os votos de um usuario.
    @Transactional(readOnly = true)
    public List<Vote> getVotesByUser(User user) {
        return voteRepository.findByUser(user);
    }

    public List<VoteResponseDTO> convertVotesToDTOs(List<Vote> votes) {
        return votes.stream().map(vote -> {
            VoteResponseDTO dto = new VoteResponseDTO();
            dto.setPollId(vote.getPoll().getId());
            dto.setPollTitle(vote.getPoll().getTitle());
            dto.setOptionId(vote.getOption().getId());
            dto.setOptionText(vote.getOption().getText());
            dto.setVotedAt(vote.getVotedAt());
            return dto;
        }).collect(Collectors.toList());
    }
}
