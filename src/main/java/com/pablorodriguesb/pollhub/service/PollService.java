package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.OptionDTO;
import com.pablorodriguesb.pollhub.dto.OptionResultDTO;
import com.pablorodriguesb.pollhub.dto.PollResponseDTO;
import com.pablorodriguesb.pollhub.dto.PollResultDTO;
import com.pablorodriguesb.pollhub.exception.BadRequestException;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.PollRepository;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PollService {

    private final PollRepository pollRepository;
    private final VoteRepository voteRepository;

    @Autowired
    public PollService(PollRepository pollRepository, VoteRepository voteRepository) {
        this.pollRepository = pollRepository;
        this.voteRepository = voteRepository;
    }

    // cria uma nova enquete, associando ao usuario criador e registrando data e hora.
    public Poll createPoll(Poll poll, User creator) {
        for (Option option : poll.getOptions()) {
            option.setPoll(poll); // definindo a relacao bidirecional
        }
        poll.setCreatedAt(LocalDateTime.now());
        poll.setCreatedBy(creator);
        return pollRepository.save(poll);
    }

    public void deletePoll(Long pollId) {
        // verifica se a enquete existe
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Enquete não encontrada"));

        // exclui a enquete (o JPA cuidara das dependências devido ao cascade)
        pollRepository.deleteById(pollId);
    }

    // retorna as enquetes públicas.
    public List<Poll> getPublicPolls() {
        return pollRepository.findByIsPublicTrue();
    }

    // retorna todas as enquetes especificas criadas por um usuario.
    public List<Poll> getPollsByUserWithDetails(User user) {
        return pollRepository.findByCreatedByWithDetails(user);
    }

    // retorna todos os votos de um usuario.
        public Optional<Poll> getPollById(Long id) {
            return pollRepository.findById(id);
    }

    public void vote(Long pollId, Long optionId, User voter) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Enquete" +
                        "não encontrada"));

        Option option = poll.getOptions().stream()
                .filter(o -> o.getId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Opcão " +
                        "não encontrada"));

        if (voteRepository.existsByPollAndUser(poll, voter)) {
            throw new BadRequestException("Você já votou nesta enquete");
        }

        Vote vote = new Vote();
        vote.setPoll(poll);
        vote.setOption(option);
        vote.setUser(voter);
        vote.setVotedAt(LocalDateTime.now());

        voteRepository.save(vote);
    }

    public PollResultDTO getResults(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enquete não encontrada"));

        List<OptionResultDTO> results = poll.getOptions().stream()
                .map(option -> {
                    int votes = voteRepository.countByOption(option);

                    OptionResultDTO dto = new OptionResultDTO();
                    dto.setOptionId(option.getId());
                    dto.setText(option.getText());
                    dto.setVotes(votes);
                    return dto;
                })
                .collect(Collectors.toList());

        PollResultDTO pollResultDTO = new PollResultDTO();
        pollResultDTO.setPollId(poll.getId());
        pollResultDTO.setTitle(poll.getTitle());
        pollResultDTO.setDescription(poll.getDescription());
        pollResultDTO.setResults(results);
        return pollResultDTO;
    }

    public PollResponseDTO convertToPollDTO(Poll poll) {
        PollResponseDTO dto = new PollResponseDTO();
        dto.setId(poll.getId());
        dto.setTitle(poll.getTitle());
        dto.setDescription(poll.getDescription());
        dto.setPublicFlag(poll.getIsPublic());
        dto.setCreatedAt(poll.getCreatedAt());
        dto.setCreatedBy(poll.getCreatedBy().getUsername());

        // Mapeamento das opções com contagem real
        dto.setOptions(poll.getOptions().stream().map(option -> {
            OptionDTO optionDTO = new OptionDTO();
            optionDTO.setId(option.getId());
            optionDTO.setText(option.getText());
            optionDTO.setVoteCount(voteRepository.countByOption(option)); // Contagem dinâmica
            return optionDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
}
