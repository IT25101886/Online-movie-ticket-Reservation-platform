package com.movie.backend.review.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("PUBLIC")
public class PublicReview extends Review {

    @Override
    public String displayReviewType() {
        return "PUBLIC";
    }
}