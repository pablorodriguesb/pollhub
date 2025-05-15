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

    // Busca enquetes criadas por um usuário
    List<Poll> findByCreatedBy(User user);

    // Consulta otimizada para enquetes públicas com o usuário (evita N+1)
    @Query("SELECT p FROM Poll p LEFT JOIN FETCH p.createdBy WHERE p.isPublic = true")
    List<Poll> findPublicPollsWithUser();

    // Consulta otimizada para enquetes de um usuário com o usuário (evita N+1)
    @Query("SELECT p FROM Poll p LEFT JOIN FETCH p.createdBy WHERE p.createdBy = :user")
    List<Poll> findByCreatedByWithUser(@Param("user") User user);

    // Consulta otimizada para enquetes de um usuário com opções (evita N+1)
    @Query("SELECT DISTINCT p FROM Poll p LEFT JOIN FETCH p.options WHERE p.createdBy = :user")
    List<Poll> findByCreatedByWithDetails(@Param("user") User user);
}
