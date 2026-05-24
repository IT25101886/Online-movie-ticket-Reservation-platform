package com.movie.backend.movie.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("UPCOMING")
public class UpcomingMovie extends Movie {

    @Override
    public String displayCategory() {
        return "UPCOMING";
    }
}