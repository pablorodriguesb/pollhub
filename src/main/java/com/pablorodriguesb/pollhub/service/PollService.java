package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.repository.PollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PollService {

    private final PollRepository pollRepository;

    @Autowired
    public PollService(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    // cria uma nova enquete, associando ao usuario criador e registrando data e hora.
    public Poll createPoll(Poll poll, User creator) {
        poll.setCreatedAt(LocalDateTime.now());
        poll.setCreatedBy(creator);
        return pollRepository.save(poll);
    }

    // retorna as enquetes públicas.
    public List<Poll> getPublicPolls() {
        return pollRepository.findByIsPublicTrue();
    }

    // retorna todas as enquetes especificas criadas por um usuario.
    public List<Poll> getPollsByUser(User user) {
        return pollRepository.findByCreatedBy(user);
    }

    // retorna todos os votos de um usuario.
        public Optional<Poll> getPollById(Long id) {
            return pollRepository.findById(id);
    }
}
