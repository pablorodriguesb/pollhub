package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.model.Option;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.repository.OptionRepository;
import com.pablorodriguesb.pollhub.repository.PollRepository;
import com.pablorodriguesb.pollhub.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private OptionRepository optionRepository;

    @Mock
    private PollRepository pollRepository;

    @InjectMocks
    private VoteService voteService;

    private User user;
    private Poll poll;
    private Option option;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("testuser");

        poll = new Poll();
        poll.setId(1L);

        option = new Option();
        option.setId(1L);
    }

    @Test
    void vote() {
        // arrange
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRepository.existsByPollAndUser(poll, user)).thenReturn(false);
        when(optionRepository.findById(1L)).thenReturn(Optional.of(option));
        when(voteRepository.save(any(Vote.class))).thenAnswer(invocation ->
                invocation.getArgument(0));

        // act
        Vote vote = voteService.vote(1L, 1L, user);

        // assert
        assertNotNull(vote);
        assertEquals(user, vote.getUser());
        assertEquals(poll, vote.getPoll());
        assertEquals(option, vote.getOption());
        assertNotNull(vote.getVotedAt());

        verify(pollRepository).findById(1L);
        verify(voteRepository).existsByPollAndUser(poll, user);
        verify(optionRepository).findById(1L);
        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    void getVotesByPoll() {
        // arrange
        Vote vote1 = new Vote();
        vote1.setPoll(poll);
        vote1.setOption(option);
        vote1.setUser(user);

        Vote vote2 = new Vote();
        vote2.setPoll(poll);
        vote2.setOption(option);
        vote2.setUser(user);

        List<Vote> votes = new ArrayList<>();
        votes.add(vote1);
        votes.add(vote2);

        when(voteRepository.findByPollId(poll.getId())).thenReturn(votes);

        // act
        List<com.pablorodriguesb.pollhub.dto.VoteResponseDTO> result =
                voteService.getVotesByPoll(poll.getId());

        // assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(voteRepository).findByPollId(poll.getId());
    }

    @Test
    void getVotesByUser() {
        // arrange
        Vote vote1 = new Vote();
        vote1.setUser(user);
        Vote vote2 = new Vote();
        vote2.setUser(user);

        List<Vote> votes = new ArrayList<>();
        votes.add(vote1);
        votes.add(vote2);

        when(voteRepository.findByUser(user)).thenReturn(votes);

        // act
        List<Vote> result = voteService.getVotesByUser(user);

        // assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(voteRepository).findByUser(user);
    }

    @Test
    void convertVotesToDTOs() {
        // arrange
        poll.setTitle("Poll Title");
        option.setText("Option Text");

        Vote vote = new Vote();
        vote.setPoll(poll);
        vote.setOption(option);
        vote.setUser(user);
        vote.setVotedAt(java.time.LocalDateTime.now());

        List<Vote> votes = new ArrayList<>();
        votes.add(vote);

        // act
        List<com.pablorodriguesb.pollhub.dto.VoteResponseDTO> dtos =
                voteService.convertVotesToDTOs(votes);

        // assert
        assertNotNull(dtos);
        assertEquals(1, dtos.size());
        var dto = dtos.get(0);
        assertEquals(poll.getId(), dto.getPollId());
        assertEquals(poll.getTitle(), dto.getPollTitle());
        assertEquals(option.getId(), dto.getOptionId());
        assertEquals(option.getText(), dto.getOptionText());
        assertNotNull(dto.getVotedAt());
    }
}