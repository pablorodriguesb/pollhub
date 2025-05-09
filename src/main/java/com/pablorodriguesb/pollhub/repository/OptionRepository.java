package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByPoll(Poll poll);
}
