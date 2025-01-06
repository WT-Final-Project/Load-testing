import { atOnceUsers, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

export default simulation((setUp) => {
    const httpProtocol = http
        .baseUrl("http://localhost:3001")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json");

    const myScenario = scenario("User Signup Scenario")
        .exec(http("Get username").get("/guillermo1")
        .check(status().is(200)));    
    
    setUp(myScenario.injectOpen(atOnceUsers(1))).protocols(httpProtocol)
    
})