package com.movie.backend.admin.dto;

public class AdminReportResponse {
    private long totalUsers;
    private long totalAdmins;
    private long totalRegularUsers;
    private long totalPremiumUsers;
    private long userManagers;
    private long movieManagers;
    private long ticketManagers;
    private long paymentManagers;
    private long reviewManagers;
    private long adminManagers;

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalRegularUsers() {
        return totalRegularUsers;
    }

    public void setTotalRegularUsers(long totalRegularUsers) {
        this.totalRegularUsers = totalRegularUsers;
    }

    public long getTotalPremiumUsers() {
        return totalPremiumUsers;
    }

    public void setTotalPremiumUsers(long totalPremiumUsers) {
        this.totalPremiumUsers = totalPremiumUsers;
    }

    public long getUserManagers() {
        return userManagers;
    }

    public void setUserManagers(long userManagers) {
        this.userManagers = userManagers;
    }

    public long getMovieManagers() {
        return movieManagers;
    }

    public void setMovieManagers(long movieManagers) {
        this.movieManagers = movieManagers;
    }

    public long getTicketManagers() {
        return ticketManagers;
    }

    public void setTicketManagers(long ticketManagers) {
        this.ticketManagers = ticketManagers;
    }

    public long getPaymentManagers() {
        return paymentManagers;
    }

    public void setPaymentManagers(long paymentManagers) {
        this.paymentManagers = paymentManagers;
    }

    public long getReviewManagers() {
        return reviewManagers;
    }

    public void setReviewManagers(long reviewManagers) {
        this.reviewManagers = reviewManagers;
    }

    public long getAdminManagers() {
        return adminManagers;
    }

    public void setAdminManagers(long adminManagers) {
        this.adminManagers = adminManagers;
    }
}
