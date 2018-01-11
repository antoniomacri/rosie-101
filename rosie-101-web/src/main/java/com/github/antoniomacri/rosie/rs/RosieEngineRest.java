package com.github.antoniomacri.rosie.rs;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.antoniomacri.rosie.*;
import com.github.antoniomacri.rosie.model.MatchRequestDto;
import com.github.antoniomacri.rosie.model.TraceRequestDto;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;


@Path("/engines")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RosieEngineRest {
    private static final ObjectMapper MAPPER = new ObjectMapper();


    @POST
    @Path("/match")
    public Response match(MatchRequestDto dto)
            throws JsonProcessingException
    {
        try (RosieEngine engine = new RosieEngine()) {
            LoadResult loadResult = engine.load(dto.getRpl());
            if (loadResult.ok != 1) {
                return buildErrorResponse(loadResult.errors);
            }

            CompilationResult compilationResult = engine.compile(dto.getPattern());
            if (compilationResult.pat == null) {
                return buildErrorResponse(compilationResult.errors);
            }


            if (dto.getStart() == null) {
                dto.setStart(1); // 1-based index
            }
            if (dto.getEncoder() == null) {
                dto.setEncoder("json");
            }

            MatchResult matchResult = engine.match(compilationResult.pat, dto.getInput(), dto.getStart(), dto.getEncoder());
            Response response = buildSuccessResponse(matchResult);
            return response;
        }
    }

    @POST
    @Path("/trace")
    public Response trace(TraceRequestDto dto)
            throws JsonProcessingException
    {
        try (RosieEngine engine = new RosieEngine()) {
            LoadResult loadResult = engine.load(dto.getRpl());
            if (loadResult.ok != 1) {
                return buildErrorResponse(loadResult.errors);
            }

            CompilationResult compilationResult = engine.compile(dto.getPattern());
            if (compilationResult.pat == null) {
                return buildErrorResponse(compilationResult.errors);
            }


            if (dto.getStart() == null) {
                dto.setStart(1); // 1-based index
            }
            if (dto.getStyle() == null) {
                dto.setStyle("condensed");
            }

            TraceResult traceResult = engine.trace(compilationResult.pat, dto.getInput(), dto.getStart(), dto.getStyle());
            Response response = buildSuccessResponse(traceResult);
            return response;
        }
    }


    private Response buildErrorResponse(String errors) throws JsonProcessingException {
        Map<String, Object> map = new HashMap<>();
        map.put("success", false);
        map.put("errors", 123456);
        // HACK to print JSON string as contents of the errors field.
        String body = MAPPER.writeValueAsString(map).replace("123456", errors);
        return Response.ok(body).build();
    }

    private Response buildSuccessResponse(MatchResult matchResult) throws JsonProcessingException {
        Map<String, Object> match = new HashMap<>();
        match.put("data", 123456);
        match.put("abend", matchResult.abend);
        match.put("leftover", matchResult.leftover);
        match.put("tmatch", matchResult.tmatch);
        match.put("ttotal", matchResult.ttotal);

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("match", match);
        // HACK to print JSON string as contents of the data field.
        String body = MAPPER.writeValueAsString(map).replace("123456", String.valueOf(matchResult.data));

        return Response.ok(body).build();
    }

    private Response buildSuccessResponse(TraceResult traceResult) {
        Map<String, Object> match = new HashMap<>();
        match.put("trace", traceResult.trace);
        match.put("matched", traceResult.matched);
        return Response.ok(match).build();
    }
}
