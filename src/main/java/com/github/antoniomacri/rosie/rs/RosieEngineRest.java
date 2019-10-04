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
    public Response match(MatchRequestDto dto) throws JsonProcessingException {
        try (RosieEngine engine = new RosieEngine()) {
            engine.load(dto.getRpl());
            Pattern pattern = engine.compile(dto.getPattern());

            if (dto.getStart() == null) {
                dto.setStart(0);
            }
            if (dto.getEncoder() == null) {
                dto.setEncoder("json");
            }

            Match match = pattern.match(dto.getInput(), dto.getStart(), dto.getEncoder());
            Response response = buildSuccessResponse(match);
            return response;
        } catch (RosieException e) {
            return buildErrorResponse(e.getErrors());
        }
    }

    @POST
    @Path("/trace")
    public Response trace(TraceRequestDto dto) throws JsonProcessingException {
        try (RosieEngine engine = new RosieEngine()) {
            engine.load(dto.getRpl());

            Pattern pattern = engine.compile(dto.getPattern());

            if (dto.getStart() == null) {
                dto.setStart(0);
            }
            if (dto.getStyle() == null) {
                dto.setStyle("condensed");
            }

            TraceResult traceResult = pattern.trace(dto.getInput(), dto.getStart(), dto.getStyle());
            Response response = buildSuccessResponse(traceResult);
            return response;
        } catch (RosieException e) {
            return buildErrorResponse(e.getErrors());
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

    private Response buildSuccessResponse(Match match) throws JsonProcessingException {
        Map<String, Object> matchMap = new HashMap<>();
        matchMap.put("data", 123456);
        matchMap.put("bool", match.matches());
        matchMap.put("abend", match.skipped());
        matchMap.put("leftover", match.remaining());
        matchMap.put("tmatch", match.matchMillis());
        matchMap.put("ttotal", match.totalMillis());

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("match", matchMap);
        // HACK to print JSON string as contents of the data field.
        String body = MAPPER.writeValueAsString(map).replace("123456", String.valueOf(match.match()));

        return Response.ok(body).build();
    }

    private Response buildSuccessResponse(TraceResult traceResult) {
        Map<String, Object> match = new HashMap<>();
        match.put("trace", traceResult.getTrace());
        match.put("matched", traceResult.matched());
        return Response.ok(match).build();
    }
}
