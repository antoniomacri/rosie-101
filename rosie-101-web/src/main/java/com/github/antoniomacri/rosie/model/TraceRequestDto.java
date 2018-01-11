package com.github.antoniomacri.rosie.model;

public class TraceRequestDto {
    private String input;
    private String rpl;
    private String pattern;

    private Integer start;
    private String style;


    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getRpl() {
        return rpl;
    }

    public void setRpl(String rpl) {
        this.rpl = rpl;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }
}
