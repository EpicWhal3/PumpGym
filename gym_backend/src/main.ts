import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: [`http://localhost:3000`],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("PumpGym API")
    .setDescription("REST API для фитнес-клуба PumpGym")
    .setVersion("1.0")
    .addTag("trainers", "Операции с тренерами")
    .addTag("tariffs", "Операции с тарифами")
    .addTag("timetable", "Операции с расписанием")
    .addTag("bookings", "Операции с заявками")
    .addTag("enrollments", "Записи на занятия и оплаты")
    .addTag(
      "user-tariff",
      "Текущий статус пользователя в системе по каждому из доступных ему тарифов.",
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}

bootstrap()
  .then(() => console.log("Bootstrap completed"))
  .catch((err) => console.error("Bootstrap failed", err));
