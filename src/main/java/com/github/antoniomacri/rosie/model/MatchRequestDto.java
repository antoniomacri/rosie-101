package com.github.antoniomacri.rosie.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class MatchRequestDto {
    private String input;
    private String rpl;
    private String pattern;

    private Integer start;
    private String encoder;
}
