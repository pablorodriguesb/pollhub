package com.pablorodriguesb.pollhub.controller;

import com.pablorodriguesb.pollhub.service.PollService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminPollController {

    private final PollService pollService;

    public AdminPollController(PollService pollService) {
        this.pollService = pollService;
    }

    // endpoint para deletar enquete por id, somente Admins
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/polls/{id}")
    public ResponseEntity<?> deletePollByAdmin(@PathVariable Long id) {
        pollService.deletePoll(id);
        return ResponseEntity.ok("Enquete deletada pelo admin.");
    }
}
