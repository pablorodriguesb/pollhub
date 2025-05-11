package com.pablorodriguesb.pollhub.service;

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
        // verificando se o email ja tem cadastro
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso.");
        }

        // verifica se o username ja tem cadastro
        if (userRepository.existsByUsernameIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Nome de usuário já está em uso.");
        }

        // gerando hash de senha antes de salvar
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // registrando data/hora do cadastro
        user.setDataCadastro(LocalDateTime.now());

        return userRepository.save(user);
    }

    // busca usuario pelo email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    // busca usuario pelo username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
    }
}
