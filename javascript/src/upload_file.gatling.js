import { simulation, scenario, constantUsersPerSec, atOnceUsers } from "@gatling.io/core";
import { http, status, RawFileBodyPart } from "@gatling.io/http";

export default simulation((setUp) => {
  // Configuración del protocolo HTTP
  const httpProtocol = http
    .baseUrl("http://localhost:3001") // Cambia la URL según tu entorno
    .acceptHeader("application/json");

  // Escenario para subir un archivo
  const uploadFileScenario = scenario("File Upload Scenario")
    .exec(
      http("Upload File")
        .post("/file") // Ruta del backend
        .bodyPart(
          RawFileBodyPart("fileContent", "./src/data/example.txt")
            .fileName("example.txt")
            .contentType("text/plain")
        ) // Uso correcto de RawFileBodyPart
        .formParam("taskId", "2833") // Task ID fijo
        .check(status().is(201)) // Comprobar que el estado de la respuesta sea 200
    );

  // Configuración de la simulación
  setUp(
    uploadFileScenario.injectOpen(atOnceUsers(1)) // Subir un archivo por segundo durante 10 segundos
  ).protocols(httpProtocol);
});
