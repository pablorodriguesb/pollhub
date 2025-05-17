package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    // Busca todas as enquetes públicas
    @Query("SELECT p FROM Poll p WHERE p.isPublic = true")
    List<Poll> findByIsPublicTrue();

    // Consulta otimizada para enquetes de um usuario com opcoes
    @Query("SELECT DISTINCT p FROM Poll p LEFT JOIN FETCH p.options WHERE p.createdBy = :user")
    List<Poll> findByCreatedByWithDetails(@Param("user") User user);
}
