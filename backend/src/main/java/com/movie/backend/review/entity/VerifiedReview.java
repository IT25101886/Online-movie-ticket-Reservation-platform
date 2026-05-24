package com.movie.backend.review.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("VERIFIED")
public class VerifiedReview extends Review {

    @Override
    public String displayReviewType() {
        return "VERIFIED";
    }
}