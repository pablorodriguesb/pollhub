package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByIsPublicTrue();
    List<Poll> findByCreatedBy(User user);
}
