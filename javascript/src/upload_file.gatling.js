import { simulation, scenario, atOnceUsers, rampUsersPerSec } from "@gatling.io/core";
import { http, status, RawFileBodyPart } from "@gatling.io/http";

// Crear función generadora de números
const numberGenerator = (() => {
  let number = 1;
  return () => number++;
})();

export default simulation((setUp) => {
  // Configuración del protocolo HTTP
  const httpProtocol = http
    .baseUrl("http://localhost:3001") // Cambia la URL según tu entorno
    .acceptHeader("application/json");

  // Crear un escenario que recorra todos los archivos
  const uploadFileScenario = scenario("Dynamic File Upload Scenario")
    .exec((session) => {
      const fileName = `example copy ${numberGenerator()}.txt`;
      return session.set("fileName", fileName); // Agregar el nombre del archivo a la sesión
    })
    .exec(
      http("Upload File")
        .post("/file") // Ruta del backend
        .bodyPart(
          RawFileBodyPart("fileContent", (session) => `./src/data/${session.get("fileName")}`)
            .fileName((session) => session.get("fileName"))
            .contentType("text/plain")
        )
        .formParam("taskId", "2") // Task ID fijo
        .check(status().is(201)) // Comprobar que el estado de la respuesta sea 201
    );

  // Configuración de la simulación
  setUp(
    uploadFileScenario.injectOpen(
      rampUsersPerSec(2).to(20).during(40)    )    
  ).protocols(httpProtocol);
});
