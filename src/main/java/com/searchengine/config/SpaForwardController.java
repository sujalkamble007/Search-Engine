package com.searchengine.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards all non-API, non-static routes to index.html
 * so the React SPA can handle client-side routing.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {"/", "/{path:^(?!api|h2-console|static|assets|favicon).*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
