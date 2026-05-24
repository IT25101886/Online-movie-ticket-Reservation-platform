package com.movie.backend.admin.controller;

import com.movie.backend.admin.dto.AdminReportResponse;
import com.movie.backend.admin.dto.ChangePermissionRequest;
import com.movie.backend.admin.dto.CreateAdminRequest;
import com.movie.backend.admin.dto.UpdateAdminRequest;
import com.movie.backend.admin.service.AdminService;
import com.movie.backend.user.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public User createAdmin(@RequestParam Long performedByAdminId,
                            @RequestBody CreateAdminRequest request) {
        return adminService.createAdmin(performedByAdminId, request);
    }

    @GetMapping
    public List<User> getAllAdmins(@RequestParam Long performedByAdminId) {
        return adminService.getAllAdmins(performedByAdminId);
    }

    @GetMapping("/search")
    public List<User> searchAdmins(@RequestParam Long performedByAdminId,
                                   @RequestParam String username) {
        return adminService.searchAdmins(performedByAdminId, username);
    }

    @GetMapping("/{adminId}")
    public User getAdminById(@PathVariable Long adminId,
                             @RequestParam Long performedByAdminId) {
        return adminService.getAdminById(performedByAdminId, adminId);
    }

    @PutMapping("/{adminId}")
    public User updateAdmin(@PathVariable Long adminId,
                            @RequestParam Long performedByAdminId,
                            @RequestBody UpdateAdminRequest request) {
        return adminService.updateAdmin(performedByAdminId, adminId, request);
    }

    @PutMapping("/{targetUserId}/permission")
    public User changePermission(@PathVariable Long targetUserId,
                                 @RequestParam Long performedByAdminId,
                                 @RequestBody ChangePermissionRequest request) {
        return adminService.changePermission(performedByAdminId, targetUserId, request);
    }

    @DeleteMapping("/{adminId}")
    public String deleteAdmin(@PathVariable Long adminId,
                              @RequestParam Long performedByAdminId) {
        adminService.deleteAdmin(performedByAdminId, adminId);
        return "Admin deleted successfully";
    }

    @GetMapping("/reports")
    public AdminReportResponse getReports(@RequestParam Long performedByAdminId) {
        return adminService.getReports(performedByAdminId);
    }
}