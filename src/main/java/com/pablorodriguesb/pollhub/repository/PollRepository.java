package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByIsPublicTrue();
    List<Poll> findByCreatedBy(User user);

    // metodos de consulta otimizados
    @Query("SELECT p FROM Poll p LEFT JOIN FETCH p.createdBy" +
            " WHERE p.isPublic = true")
    List<Poll> findPublicPollsWithUser();

    @Query("SELECT p FROM Poll p LEFT JOIN FETCH p.createdBy" +
            " WHERE p.createdBy = :user")
    List<Poll> findByCreatedByWithUser(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Poll p LEFT JOIN FETCH p.options" +
            " WHERE p.createdBy = :user")
    List<Poll> findByCreatedByWithDetails(@Param("user") User user);
}
