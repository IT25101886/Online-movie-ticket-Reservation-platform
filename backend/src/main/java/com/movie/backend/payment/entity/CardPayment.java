package com.movie.backend.payment.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CARD")
public class CardPayment extends Payment {

    @Override
    public String displayPaymentType() {
        return "CARD";
    }
}