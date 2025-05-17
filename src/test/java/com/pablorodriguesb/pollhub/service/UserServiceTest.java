package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.UserDTO;
import com.pablorodriguesb.pollhub.dto.UserResponseDTO;
import com.pablorodriguesb.pollhub.exception.UserAlreadyExistsException;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        // objetos para uso nos testes
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");

        testUserDTO = new UserDTO();
        testUserDTO.setUsername("testuser");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setPassword("password123");
    }

    @Test
    void registerUser() {
        String senhaOriginal = testUser.getPassword(); // string com a senha devido ao encode

        // arrange
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // act
        User result = userService.registerUser(testUser);

        // assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(passwordEncoder).encode(senhaOriginal);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findByUsername() {
        // arrange

        when(userRepository.findByUsernameIgnoreCase("testuser"))
                .thenReturn(Optional.of(testUser));

        // act
        Optional<User> result = userService.findByUsername("testuser");

        // assert
        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
        verify(userRepository).findByUsernameIgnoreCase("testuser");
    }

    @Test
    void convertToEntity() {
        // act
        User result = userService.convertToEntity(testUserDTO);

        // assert
        assertNotNull(result);
        assertEquals(testUserDTO.getUsername(), result.getUsername());
        assertEquals(testUserDTO.getEmail(), result.getEmail());
        assertEquals(testUserDTO.getPassword(), result.getPassword());
    }

    @Test
    void convertToResponseDTO() {
        // act
        UserResponseDTO result = userService.convertToResponseDTO(testUser);

        // assert
        assertNotNull(result);
        assertEquals(testUser.getUsername(), result.getUsername());
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    // cenario de erro adicional para email existente
    @Test
    void registerUser_EmailAlreadyExists() {
        //arrange
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(true);

        // act e assert
        assertThrows(UserAlreadyExistsException.class, () -> {
            userService.registerUser(testUser);
        });
        verify(userRepository, never()).save(any());
    }

    // outro cenario de erro para username existente
    @Test
    void registerUser_UsernameAlreadyExists() {
        //arrange
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        when(userRepository.existsByUsernameIgnoreCase(anyString()))
                .thenReturn(true);

        // act e assert
        assertThrows(UserAlreadyExistsException.class, () -> {
            userService.registerUser(testUser);
        });
        verify(userRepository, never()).save(any());
    }
}