package com.movie.backend.admin.dto;

public class ChangePermissionRequest {
    private String accountType;      // REGULAR / PREMIUM / ADMIN
    private String adminPermission;  // only used if accountType = ADMIN

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getAdminPermission() {
        return adminPermission;
    }

    public void setAdminPermission(String adminPermission) {
        this.adminPermission = adminPermission;
    }
}