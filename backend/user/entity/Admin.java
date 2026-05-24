package com.movie.backend.user.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    @Override
    public double getDiscountRate() {
        return 0.0;
    }
}