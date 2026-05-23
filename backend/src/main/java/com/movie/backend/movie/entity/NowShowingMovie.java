package com.movie.backend.movie.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("NOW_SHOWING")
public class NowShowingMovie extends Movie {

    @Override
    public String displayCategory() {
        return "NOW_SHOWING";
    }
}