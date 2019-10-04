package com.github.antoniomacri.rosie.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class TraceRequestDto {
    private String input;
    private String rpl;
    private String pattern;

    private Integer start;
    private String style;
}
