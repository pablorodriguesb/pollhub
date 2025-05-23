package com.pablorodriguesb.pollhub.controller;


import com.pablorodriguesb.pollhub.dto.UserDTO;
import com.pablorodriguesb.pollhub.dto.UserResponseDTO;
import com.pablorodriguesb.pollhub.model.User;
import com.pablorodriguesb.pollhub.security.JwtTokenUtil;
import com.pablorodriguesb.pollhub.service.CustomUserDetailsService;
import com.pablorodriguesb.pollhub.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UserDTO userDTO) throws
            Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userDTO.getUsername(),
                            userDTO.getPassword()));
        } catch (BadCredentialsException e) {
            throw new Exception("Usuário ou senha inválidos", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(userDTO.getUsername());

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        final String token = jwtTokenUtil.generateToken(userDetails, role);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    // classe interna para responder o token
    @Data
    static class AuthResponse {
        private final String token;

        public AuthResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }
    }
}
