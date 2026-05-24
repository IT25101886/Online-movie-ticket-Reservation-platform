package com.movie.backend.admin.seeder;

import com.movie.backend.user.entity.Admin;
import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DefaultAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public DefaultAdminSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        createAdminIfNotExists(
                "superadmin",
                "System Admin Manager",
                "superadmin@movie.com",
                "admin123",
                "0700000000",
                AdminPermission.ADMIN_MANAGER
        );

        createAdminIfNotExists(
                "usermanager",
                "Default User Manager",
                "usermanager@movie.com",
                "user123",
                "0711111111",
                AdminPermission.USER_MANAGER
        );

        createAdminIfNotExists(
                "moviemanager",
                "Default Movie Manager",
                "moviemanager@movie.com",
                "movie123",
                "0722222222",
                AdminPermission.MOVIE_MANAGER
        );

        createAdminIfNotExists(
                "ticketmanager",
                "Default Booking Manager",
                "ticketmanager@movie.com",
                "ticket123",
                "0733333333",
                AdminPermission.TICKET_MANAGER
        );

        createAdminIfNotExists(
                "paymentmanager",
                "Default Payment Manager",
                "paymentmanager@movie.com",
                "payment123",
                "0744444444",
                AdminPermission.PAYMENT_MANAGER
        );

        createAdminIfNotExists(
                "reviewmanager",
                "Default Review Manager",
                "reviewmanager@movie.com",
                "review123",
                "0755555555",
                AdminPermission.REVIEW_MANAGER
        );
    }

    private void createAdminIfNotExists(
            String username,
            String fullName,
            String email,
            String password,
            String phone,
            AdminPermission permission
    ) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Admin admin = new Admin();
            admin.setFullName(fullName);
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPassword(password);
            admin.setPhone(phone);
            admin.setAdmin(true);
            admin.setAdminPermission(permission);
            admin.setActive(true);

            userRepository.save(admin);
        }
    }
}