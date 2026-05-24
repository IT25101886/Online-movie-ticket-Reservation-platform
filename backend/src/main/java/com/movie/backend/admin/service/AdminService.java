package com.movie.backend.admin.service;

import com.movie.backend.admin.dto.AdminReportResponse;
import com.movie.backend.admin.dto.ChangePermissionRequest;
import com.movie.backend.admin.dto.CreateAdminRequest;
import com.movie.backend.admin.dto.UpdateAdminRequest;
import com.movie.backend.user.entity.*;
import com.movie.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User requireAdminManager(Long performedByAdminId) {
        User actor = userRepository.findById(performedByAdminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        if (!actor.isAdmin() || actor.getAdminPermission() != AdminPermission.ADMIN_MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN_MANAGER can do this action");
        }

        return actor;
    }

    public User createAdmin(Long performedByAdminId, CreateAdminRequest request) {
        requireAdminManager(performedByAdminId);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        String permissionText = request.getAdminPermission() == null ? "" : request.getAdminPermission().toUpperCase();

        if (permissionText.isBlank() || "NONE".equals(permissionText)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose a valid admin permission");
        }

        Admin admin = new Admin();
        admin.setFullName(request.getFullName());
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        admin.setPhone(request.getPhone());
        admin.setAdmin(true);
        admin.setAdminPermission(AdminPermission.valueOf(permissionText));
        admin.setActive(true);

        return userRepository.save(admin);
    }

    public List<User> getAllAdmins(Long performedByAdminId) {
        requireAdminManager(performedByAdminId);
        return userRepository.findByAdminTrueOrderByIdAsc();
    }

    public List<User> searchAdmins(Long performedByAdminId, String username) {
        requireAdminManager(performedByAdminId);
        return userRepository.findByAdminTrueAndUsernameContainingIgnoreCaseOrderByIdAsc(username);
    }

    public User getAdminById(Long performedByAdminId, Long adminId) {
        requireAdminManager(performedByAdminId);

        return userRepository.findByIdAndAdminTrue(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
    }

    public User updateAdmin(Long performedByAdminId, Long adminId, UpdateAdminRequest request) {
        requireAdminManager(performedByAdminId);

        User target = userRepository.findByIdAndAdminTrue(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        if ("superadmin".equalsIgnoreCase(target.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Default system admin cannot be modified");
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equalsIgnoreCase(target.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(target.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            target.setFullName(request.getFullName());
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            target.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            target.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            target.setPassword(request.getPassword());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            target.setPhone(request.getPhone());
        }
        if (request.getAdminPermission() != null && !request.getAdminPermission().isBlank()) {
            target.setAdminPermission(AdminPermission.valueOf(request.getAdminPermission().toUpperCase()));
        }

        return userRepository.save(target);
    }

    @Transactional
    public User changePermission(Long performedByAdminId, Long targetUserId, ChangePermissionRequest request) {
        requireAdminManager(performedByAdminId);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if ("superadmin".equalsIgnoreCase(targetUser.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Default system admin cannot be modified");
        }

        String accountType = request.getAccountType() == null ? "" : request.getAccountType().toUpperCase();

        if (!accountType.equals("REGULAR") && !accountType.equals("PREMIUM") && !accountType.equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "accountType must be REGULAR, PREMIUM, or ADMIN");
        }

        boolean isAdmin = "ADMIN".equals(accountType);
        String permission = "NONE";

        if (isAdmin) {
            if (request.getAdminPermission() == null || request.getAdminPermission().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin permission is required for ADMIN");
            }
            permission = request.getAdminPermission().toUpperCase();
        }

        userRepository.changeUserRole(targetUserId, accountType, isAdmin, permission);
        entityManager.flush();
        entityManager.clear();

        return userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Updated user not found"));
    }

    public void deleteAdmin(Long performedByAdminId, Long adminId) {
        requireAdminManager(performedByAdminId);

        User target = userRepository.findByIdAndAdminTrue(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        if ("superadmin".equalsIgnoreCase(target.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Default system admin cannot be deleted");
        }

        userRepository.delete(target);
    }

    public AdminReportResponse getReports(Long performedByAdminId) {
        requireAdminManager(performedByAdminId);

        List<User> allUsers = userRepository.findAll();

        long regularUsers = allUsers.stream().filter(u -> !u.isAdmin() && u instanceof RegularUser).count();
        long premiumUsers = allUsers.stream().filter(u -> !u.isAdmin() && u instanceof PremiumUser).count();

        AdminReportResponse report = new AdminReportResponse();
        report.setTotalUsers(userRepository.count());
        report.setTotalAdmins(userRepository.countByAdminTrue());
        report.setTotalRegularUsers(regularUsers);
        report.setTotalPremiumUsers(premiumUsers);
        report.setUserManagers(userRepository.countByAdminPermission(AdminPermission.USER_MANAGER));
        report.setMovieManagers(userRepository.countByAdminPermission(AdminPermission.MOVIE_MANAGER));
        report.setTicketManagers(userRepository.countByAdminPermission(AdminPermission.TICKET_MANAGER));
        report.setPaymentManagers(userRepository.countByAdminPermission(AdminPermission.PAYMENT_MANAGER));
        report.setReviewManagers(userRepository.countByAdminPermission(AdminPermission.REVIEW_MANAGER));
        report.setAdminManagers(userRepository.countByAdminPermission(AdminPermission.ADMIN_MANAGER));

        return report;
    }
}