package com.movie.backend.user.controller;

import com.movie.backend.user.dto.LoginRequest;
import com.movie.backend.user.dto.RegisterUserRequest;
import com.movie.backend.user.dto.UpdateUserRequest;
import com.movie.backend.user.entity.User;
import com.movie.backend.user.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterUserRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    
}