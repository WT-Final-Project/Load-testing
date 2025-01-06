import { simulation, scenario, StringBody, constantUsersPerSec } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

const randomUsername = () => `user_${Math.floor(Math.random() * 1000000)}`;

export default simulation((setUp) => {
  // Configuración del protocolo HTTP
  const httpProtocol = http
    .baseUrl("http://localhost:3001") // Cambia la URL según tu entorno
    .acceptHeader("application/json")
    .contentTypeHeader("application/json");

  // Escenario para registrar un usuario
  const createUserScenario = scenario("User Signup Scenario")
    .exec(
      http("Create User")
        .post("/user/signup")
        .body(
          StringBody((session) => {
            const username = randomUsername();
            const email = `${username}@example.com`;
            return JSON.stringify({
              username: username,
              name: "Test",
              lastName: "User",
              email: email,
              password: "SecurePassword123"
            });
          })
        )
        .check(status().is(201))
    );

  // Configuración de la simulación
  setUp(
    createUserScenario.injectOpen(
      constantUsersPerSec(2).during(10) // Ajustado para mantener 10 usuarios por segundo durante 20 segundos
    )
  ).protocols(httpProtocol);
});
