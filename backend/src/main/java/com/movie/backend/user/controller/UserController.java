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

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/customers")
    public List<User> getAllCustomers() {
        return userService.getAllCustomers();
    }

    @GetMapping("/customers/search")
    public List<User> searchCustomersByUsername(@RequestParam String username) {
        return userService.searchCustomersByUsername(username);
    }

    @GetMapping("/customers/{id}")
    public User getCustomerById(@PathVariable Long id) {
        return userService.getCustomerById(id);
    }

    @PutMapping("/customers/{id}/status")
    public User changeCustomerStatus(@PathVariable Long id, @RequestParam boolean active) {
        return userService.changeCustomerActiveStatus(id, active);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    
}