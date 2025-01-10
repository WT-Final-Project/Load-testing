import { simulation, scenario, StringBody, jsonPath, atOnceUsers, pause, constantUsersPerSec, rampUsersPerSec } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

const randomProjectName = () => `project_${Math.floor(Math.random() * 1000000)}`;
const randomTaskTitle = () => `task_${Math.floor(Math.random() * 1000000)}`;

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl("http://localhost:3001") // Ajusta la URL según tu entorno
    .acceptHeader("application/json")
    .contentTypeHeader("application/json");

  const userCredentials = {
    email: "testuser@example.com",
    password: "SecurePassword123",
  };

  const userSession = scenario("User Workflow Scenario")
    // Iniciar sesión
    .exec(
      http("User Sign In")
        .post("/user/signin")
        .body(
          StringBody(JSON.stringify(userCredentials))
        )
        .check(status().is(200))
        .check(jsonPath("$.data.user.username").saveAs("username")) // Corregido el path para obtener el username
    )

    .pause(2) // Espera de 2 segundos antes de crear el proyecto

    // Crear un proyecto
    .exec(
      http("Create Project")
        .post("/project/")
        .body(
          StringBody((session) => {
            const projectName = randomProjectName();
            return JSON.stringify({
              username: session.get("username"),
              name: projectName,
              description: `Description for ${projectName}`,
            });
          })
        )
        .check(status().is(201))
        .check(jsonPath("$.data.projectid").saveAs("projectId"))
    )

    .pause(2) // Espera de 2 segundos antes de añadir la tarea

    // Añadir una tarea al proyecto
    .exec(
      http("Add Task")
        .post("/task")
        .body(
          StringBody((session) => {
            const taskTitle = randomTaskTitle();
            return JSON.stringify({
              projectId: session.get("projectId"), // Usar el projectId obtenido al crear el proyecto
              username: session.get("username"),
              title: taskTitle,
              description: `Description for ${taskTitle}`,
              dueDate: new Date().toISOString(),
            });
          })
        )
        .check(status().is(201))
    );

  setUp(
    userSession.injectOpen(
      rampUsersPerSec(5).to(10).during(30)    )    
  ).protocols(httpProtocol);
});
