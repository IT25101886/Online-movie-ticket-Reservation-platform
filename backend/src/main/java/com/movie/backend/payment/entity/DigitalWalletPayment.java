package com.movie.backend.payment.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("DIGITAL_WALLET")
public class DigitalWalletPayment extends Payment {

    @Override
    public String displayPaymentType() {
        return "DIGITAL_WALLET";
    }
}