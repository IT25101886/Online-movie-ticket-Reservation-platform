package com.movie.backend.user.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("REGULAR")
public class RegularUser extends User {

    @Override
    public double getDiscountRate() {
        return 0.0;
    }
}