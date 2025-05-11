package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.VoteResponseDTO;
import com.pablorodriguesb.pollhub.exception.BadRequestException;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.OptionRepository;
import com.pablorodriguesb.pollhub.repository.PollRepository;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final OptionRepository optionRepository;
    private final PollRepository pollRepository;

    @Autowired
    public VoteService(VoteRepository voteRepository, OptionRepository optionRepository,
                       PollRepository pollRepository) {
        this.voteRepository = voteRepository;
        this.optionRepository = optionRepository;
        this.pollRepository = pollRepository;
    }

    // registra o voto de um usuario em uma enquete
    public Vote vote(Long pollId, Long optionId, User user) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Enquete" +
                        "não encontrada"));

        // Verifica se já votou
        if (voteRepository.existsByPollAndUser(poll, user)) {
            throw new BadRequestException("Você já votou nesta enquete");
        }

        Option option = optionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Opção não encontrada"));

        // cria e salva o voto
        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPoll(poll);
        vote.setOption(option);
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
