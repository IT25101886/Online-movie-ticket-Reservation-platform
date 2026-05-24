package com.movie.backend.booking.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("PREMIUM")
public class PremiumBooking extends Booking {

    @Override
    public double getSeatPrice() {
        return 1800.00;
    }

    @Override
    public String displayBookingType() {
        return "PREMIUM";
    }
}
