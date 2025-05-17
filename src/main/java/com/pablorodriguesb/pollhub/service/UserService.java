package com.pablorodriguesb.pollhub.service;

import com.pablorodriguesb.pollhub.dto.UserDTO;
import com.pablorodriguesb.pollhub.dto.UserResponseDTO;
import com.pablorodriguesb.pollhub.exception.UserAlreadyExistsException;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // realizando cadastro de um novo usuario
    public User registerUser(User user) {

        // verifica campo vazio ou nulo de email
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("O email não pode ser vazio.");
        }

        // verifica vazio ou nulo de username
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("O username não pode ser vazio.");
        }

        // verificando se o email ja tem cadastro
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new UserAlreadyExistsException("Email já está em uso.");
        }

        // verifica se o username ja tem cadastro
        if (userRepository.existsByUsernameIgnoreCase(user.getUsername())) {
            throw new UserAlreadyExistsException("Nome de usuário já está em uso.");
        }

        // verifica vazio ou nulo ao codificar senha
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("A senha não pode ser vazia.");
        }

        // gerando hash de senha antes de salvar
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // registrando data/hora do cadastro
        user.setDataCadastro(LocalDateTime.now());

        return userRepository.save(user);
    }

    // busca usuario pelo username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
    }

    // metodos auxiliares
    // converter dto para user
    public User convertToEntity(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // a senha sera criptografada no service
        return user;
    }


    // conversao de User para UserResponseDTO
    public UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        return dto;
    }



}
