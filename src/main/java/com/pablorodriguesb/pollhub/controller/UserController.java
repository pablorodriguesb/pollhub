package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.PollResponseDTO;
import com.pablorodriguesb.pollhub.dto.UserDTO;
import com.pablorodriguesb.pollhub.dto.UserResponseDTO;
import com.pablorodriguesb.pollhub.dto.VoteResponseDTO;
import com.pablorodriguesb.pollhub.exception.UserAlreadyExistsException;
import com.pablorodriguesb.pollhub.model.Poll;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.service.PollService;
import com.pablorodriguesb.pollhub.service.UserService;
import com.pablorodriguesb.pollhub.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final VoteService voteService;
    private final PollService pollService;

    @Autowired
    public UserController(UserService userService, VoteService voteService,
                          PollService pollService) {
        this.userService = userService;
        this.voteService = voteService;
        this.pollService = pollService;
    }

    // metodo auxiliar para converter user para dto
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        // nao incluir a senha por seguranca
        return dto;
    }

    // metodo auxiliar para converter dto para user
    private User convertToEntity(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // a senha sera criptografada no service
        return user;
    }

    // endpoint para cadastro de novo usuario.
    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            User user = convertToEntity(userDTO);
            User createdUser = userService.registerUser(user);
            return ResponseEntity.ok(convertToResponseDTO(createdUser));
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // endpoint para buscar usuario por username.
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponseDTO> getUserByUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(this::convertToResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // lista todas enquetes criadas por um usuario.
    @GetMapping("/{username}/polls")
    public ResponseEntity<List<PollResponseDTO>> getUserPolls(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));

        List<Poll> polls = pollService.getPollsByUserWithDetails(user);

        return ResponseEntity.ok(
                polls.stream()
                        .map(pollService::convertToPollDTO)  // metodo auxiliar
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/me/votes")
    public ResponseEntity<List<VoteResponseDTO>> getMyVotes(
            @AuthenticationPrincipal UserDetails userDetails) {
        if(userDetails == null) {
            throw new AccessDeniedException("Acesso negado: usuário não autenticado");
        }
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        List<Vote> votes = voteService.getVotesByUser(currentUser);
        List<VoteResponseDTO> dtos = voteService.convertVotesToDTOs(votes);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/me/polls")
    public ResponseEntity<List<PollResponseDTO>> getMyPolls(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Acesso negado: usuário não autenticado");
        }
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado"));
        List<Poll> polls = pollService.getPollsByUserWithDetails(currentUser);
        return ResponseEntity.ok(polls.stream()
                .map(pollService::convertToPollDTO)
                .collect(Collectors.toList()));
    }

    // metodo auxiliar para conversao de User para UserResponseDTO
    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        return dto;
    }
}
