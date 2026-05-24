package com.movie.backend.booking.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STANDARD")
public class StandardBooking extends Booking {

    @Override
    public double getSeatPrice() {
        return 1200.00;
    }

    @Override
    public String displayBookingType() {
        return "STANDARD";
    }
}