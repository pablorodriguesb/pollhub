package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User createTestUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        return user;
    }

    // teste para usuario encontrado pelo username
    @Test
    void loadUserByUsername_UserFoundByUsername() {
        // arrange
        User user = createTestUser();
        when(userRepository.findByUsernameIgnoreCase("testuser"))
                .thenReturn(Optional.of(user));

        // act
        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername("testuser");

        // assert
        assertNotNull(userDetails);
        assertEquals(user.getUsername(), userDetails.getUsername());
        assertEquals(user.getPassword(), userDetails.getPassword());
        verify(userRepository).findByUsernameIgnoreCase("testuser");
        verify(userRepository, never()).findByEmailIgnoreCase(anyString());
    }

    // teste para usuario encontrado pelo email
    @Test
    void loadUserByUsername_UserFoundByEmail() {
        // arrange
        User user = createTestUser();
        when(userRepository.findByUsernameIgnoreCase("test@example.com"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("test@example.com"))
                .thenReturn(Optional.of(user));

        // act
        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername("test@example.com");

        // assert
        assertNotNull(userDetails);
        assertEquals(user.getUsername(), userDetails.getUsername());
        verify(userRepository).findByUsernameIgnoreCase("test@example.com");
        verify(userRepository).findByEmailIgnoreCase("test@example.com");
    }

    // teste para usuario nao encontrado
    @Test
    void loadUserByUsername_UserNotFound() {
        // arrange
        when(userRepository.findByUsernameIgnoreCase("invalid"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("invalid"))
                .thenReturn(Optional.empty());

        // act e assert
        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("invalid");
        });
    }
}