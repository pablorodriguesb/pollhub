package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndPoll(User user, Poll poll);
    List<Vote> findByPoll(Poll poll);
    List<Vote> findByUser(User user);
}
