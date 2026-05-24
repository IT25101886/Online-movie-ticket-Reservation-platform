package com.movie.backend.user.service;

import com.movie.backend.user.dto.LoginRequest;
import com.movie.backend.user.dto.RegisterUserRequest;
import com.movie.backend.user.dto.UpdateUserRequest;
import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.entity.PremiumUser;
import com.movie.backend.user.entity.RegularUser;
import com.movie.backend.user.entity.User;
import com.movie.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        String type = request.getUserType() == null ? "REGULAR" : request.getUserType().toUpperCase();

        if ("ADMIN".equals(type)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Public registration cannot create admins");
        }

        User user;
        switch (type) {
            case "PREMIUM" -> user = new PremiumUser();
            default -> user = new RegularUser();
        }

        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhone(request.getPhone());
        user.setAdmin(false);
        user.setAdminPermission(AdminPermission.NONE);
        user.setActive(true);
        user.setProfileImage(null);

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is deactivated");
        }

        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public List<User> getAllCustomers() {
        return userRepository.findByAdminFalseOrderByIdAsc();
    }

    public List<User> searchCustomersByUsername(String username) {
        return userRepository.findByAdminFalseAndUsernameContainingIgnoreCaseOrderByIdAsc(username);
    }

    public User getCustomerById(Long id) {
        return userRepository.findByIdAndAdminFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getProfileImage() != null && !request.getProfileImage().isBlank()) {
            user.setProfileImage(request.getProfileImage());
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
    }

    public User changeCustomerActiveStatus(Long id, boolean active) {
        User user = getCustomerById(id);
        user.setActive(active);
        return userRepository.save(user);
    }
}