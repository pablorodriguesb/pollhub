package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByPollId(Long pollId);
    List<Vote> findByUser(User user);
    boolean existsByPollAndUser(Poll poll, User user);
    int countByOption(Option option);
}
