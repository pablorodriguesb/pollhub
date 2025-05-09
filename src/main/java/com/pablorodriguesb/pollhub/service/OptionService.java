package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.repository.OptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OptionService {

    private final OptionRepository optionRepository;

    @Autowired
    public OptionService(OptionRepository optionRepository) {
        this.optionRepository = optionRepository;
    }

    // retorna todas as opcoes de uma enquete.
    public List<Option> getOptionByPoll(Poll poll) {
        return optionRepository.findByPoll(poll);
    }

    // salva nova opcao de voto.
    public Option saveOption(Option option) {
        return optionRepository.save(option);
    }
}
