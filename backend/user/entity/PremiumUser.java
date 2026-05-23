package com.movie.backend.user.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("PREMIUM")
public class PremiumUser extends User {

    @Override
    public double getDiscountRate() {
        return 10.0;
    }
}