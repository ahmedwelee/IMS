package com.application.cv_application.controllers;

import com.application.cv_application.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private UserService userService;

    @GetMapping("/check")
    public ResponseEntity<?> checkUser(@AuthenticationPrincipal OidcUser oidcUser) {
        userService.checkUser(oidcUser);
        return ResponseEntity.ok().build();
    }
}
