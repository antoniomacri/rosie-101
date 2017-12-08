package com.github.antoniomacri.rosie.rs;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.antoniomacri.rosie.CompilationResult;
import com.github.antoniomacri.rosie.MatchResult;
import com.github.antoniomacri.rosie.RosieEngine;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Path("/engines")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RosieEngineRest {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static Map<String, RosieEngine> engines = new ConcurrentHashMap<>();


    @POST
    public Response createEngine() {
        RosieEngine engine = new RosieEngine();
        String engineId = String.valueOf(engine.hashCode());
        engines.put(engineId, engine);
        return Response.ok(engineId).build();
    }

    @DELETE
    @Path("/{engine}")
    public Response deleteEngine(@PathParam("engine") String engineId) {
        engines.remove(engineId);
        return Response.noContent().build();
    }


    @GET
    @Path("/{engine}/configuration")
    public Response configuration(@PathParam("engine") String engineId) {
        RosieEngine engine = engines.get(engineId);
        if (engine == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        String config = engine.config();

        return Response.ok().entity(config).build();
    }

    @POST
    @Path("/{engine}/patterns")
    @Consumes(MediaType.TEXT_PLAIN)
    public Response compile(@PathParam("engine") String engineId, String pattern) throws JsonProcessingException {
        RosieEngine engine = engines.get(engineId);
        if (engine == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        CompilationResult result = engine.compile(pattern);

        if (result.pat == null) {
            Map<String, Object> map = new HashMap<>();
            map.put("success", false);
            map.put("errors", 123456);
            // HACK to print JSON string as contents of the errors field.
            String body = MAPPER.writeValueAsString(map).replace("123456", result.errors);
            return Response.ok(body).build();
        }

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("patternDescriptor", result.pat);
        return Response.ok(map).build();
    }

    @POST
    @Path("/{engine}/patterns/{pattern}/match")
    @Consumes(MediaType.TEXT_PLAIN)
    public Response match(@PathParam("engine") String engineId, @PathParam("pattern") int patternDescriptor,
                          @QueryParam("start") Integer start, @QueryParam("encoder") String encoder,
                          String input)
            throws JsonProcessingException
    {
        RosieEngine engine = engines.get(engineId);
        if (engine == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        if (start == null) {
            start = 1; // 1-based index
        }
        if (encoder == null) {
            encoder = "json";
        }

        MatchResult result = engine.match(patternDescriptor, input, start, encoder);

        Map<String, Object> map = new HashMap<>();
        map.put("data", 123456);
        map.put("abend", result.abend);
        map.put("leftover", result.leftover);
        map.put("tmatch", result.tmatch);
        map.put("ttotal", result.ttotal);

        // HACK to print JSON string as contents of the data field.
        String body = MAPPER.writeValueAsString(map).replace("123456", String.valueOf(result.data));
        return Response.ok(body).build();
    }
}
