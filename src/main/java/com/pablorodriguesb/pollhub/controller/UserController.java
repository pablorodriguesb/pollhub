package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.dto.UserDTO;
import com.pablorodriguesb.pollhub.dto.VoteResponseDTO;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.model.Vote;
import com.pablorodriguesb.pollhub.service.UserService;
import com.pablorodriguesb.pollhub.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final VoteService voteService;

    @Autowired
    public UserController(UserService userService, VoteService voteService) {
        this.userService = userService;
        this.voteService = voteService;
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
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO) {
        User user = convertToEntity(userDTO);
        User createdUser = userService.registerUser(user);
        return ResponseEntity.ok(convertToDTO(createdUser));
    }

    // endpoint para buscar usuario por username.
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
}
