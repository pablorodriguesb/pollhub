package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.PollResponseDTO;
import com.pablorodriguesb.pollhub.exception.BadRequestException;
import com.pablorodriguesb.pollhub.exception.ResourceNotFoundException;
import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.PollRepository;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PollServiceTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private VoteRepository voteRepository;

    @InjectMocks
    private PollService pollService;

    private Poll poll;
    private User user;
    private Option option;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("user1");

        poll = new Poll();
        poll.setId(1L);
        poll.setTitle("Enquete Teste");
        poll.setDescription("descricao");
        poll.setIsPublic(true);
        poll.setCreatedAt(LocalDateTime.now());
        poll.setCreatedBy(user);

        option = new Option();
        option.setId(10L);
        option.setText("Opcao 1");
        option.setPoll(poll);

        poll.setOptions(List.of(option));
    }

    @Test
    void createPoll() {
        // arrange
        Poll newPoll = new Poll();
        newPoll.setOptions(new ArrayList<>(List.of(new Option())));
        when(pollRepository.save(any(Poll.class))).thenReturn(poll);

        // act
        Poll created = pollService.createPoll(newPoll, user);

        // assert
        assertNotNull(created);
        assertEquals(poll.getId(), created.getId());
        assertEquals(user, created.getCreatedBy());
        verify(pollRepository).save(any(Poll.class));
    }

    @Test
    void deletePoll() {
        // arrange
        when(pollRepository.findById(2L)).thenReturn(Optional.empty());

        // act e assert
        assertThrows(ResourceNotFoundException.class, () ->
                pollService.deletePoll(2L));
        verify(pollRepository).findById(2L);
        verify(pollRepository, never()).deleteById(anyLong());;
    }

    @Test
    void getPublicPolls_returnPublicPolls() {
        // arrange
        Poll poll2 = new Poll();
        poll2.setId(2L);
        poll2.setIsPublic(true);

        List<Poll> publicPolls = List.of(poll, poll2);

        when(pollRepository.findByIsPublicTrue()).thenReturn(publicPolls);

        // act
        List<Poll> result = pollService.getPublicPolls();

        // assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(Poll::getIsPublic));
        verify(pollRepository).findByIsPublicTrue();
    }

    @Test
    void getPollsByUserWithDetails() {
        // arrange
        List<Poll> polls = List.of(poll);
        when(pollRepository.findByCreatedByWithDetails(user))
                .thenReturn(polls);

        // act
        List<Poll> result = pollService.getPollsByUserWithDetails(user);

        // assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(poll, result.get(0));
        verify(pollRepository).findByCreatedByWithDetails(user);
    }

    @Test
    void getPollById_found() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        // act
        Optional<Poll> result = pollService.getPollById(1L);

        // assert
        assertTrue(result.isPresent());
        assertEquals(poll, result.get());
        verify(pollRepository).findById(1L);
    }

    @Test
    void getPollById_notFound() {
        // arrange
        when(pollRepository.findById(2L)).thenReturn(Optional.empty());

        // act
        Optional<Poll> result = pollService.getPollById(2L);

        // assert
        assertTrue(result.isEmpty());
        verify(pollRepository).findById(2L);
    }

    @Test
    void vote_success() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRepository.existsByPollAndUser(poll, user)).thenReturn(false);

        // act
        pollService.vote(1L, option.getId(), user);

        // assert
        verify(pollRepository).findById(1L);
        verify(voteRepository).existsByPollAndUser(poll, user);
        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    void vote_alreadyVoted() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRepository.existsByPollAndUser(poll, user)).thenReturn(true);

        // act & assert
        assertThrows(BadRequestException.class, () -> pollService.vote(1L, option.getId(), user));
        verify(voteRepository, never()).save(any());
    }

    @Test
    void vote_pollNotFound() {
        // arrange
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        // act & assert
        assertThrows(ResourceNotFoundException.class, () -> pollService.vote(99L, option.getId(), user));
        verify(voteRepository, never()).save(any());
    }

    @Test
    void vote_optionNotFound() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        // Remove todas as opções para simular não encontrado
        poll.setOptions(List.of());

        // act & assert
        assertThrows(ResourceNotFoundException.class, () -> pollService.vote(1L, 999L, user));
        verify(voteRepository, never()).save(any());
    }

    @Test
    void getResults_success() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRepository.countByOption(option)).thenReturn(5);

        // act
        var result = pollService.getResults(1L);

        // assert
        assertNotNull(result);
        assertEquals(poll.getId(), result.getPollId());
        assertEquals(poll.getTitle(), result.getTitle());
        assertEquals(1, result.getResults().size());
        assertEquals(option.getId(), result.getResults().get(0).getOptionId());
        assertEquals(5, result.getResults().get(0).getVotes());
        verify(pollRepository).findById(1L);
        verify(voteRepository).countByOption(option);
    }

    @Test
    void getResults_pollNotFound() {
        // arrange
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        // act & assert
        assertThrows(ResourceNotFoundException.class, () -> pollService.getResults(99L));
    }

    @Test
    void convertToPollDTO_success() {
        // arrange
        when(voteRepository.countByOption(option)).thenReturn(3);

        // act
        PollResponseDTO dto = pollService.convertToPollDTO(poll);

        // assert
        assertNotNull(dto);
        assertEquals(poll.getId(), dto.getId());
        assertEquals(poll.getTitle(), dto.getTitle());
        assertEquals(poll.getDescription(), dto.getDescription());
        assertEquals(poll.getIsPublic(), dto.getPublicFlag());
        assertEquals(user.getUsername(), dto.getCreatedBy());
        assertEquals(1, dto.getOptions().size());
        assertEquals(option.getId(), dto.getOptions().get(0).getId());
        assertEquals(3, dto.getOptions().get(0).getVoteCount());
        verify(voteRepository).countByOption(option);
    }
}