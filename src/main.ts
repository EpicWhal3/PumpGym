import { NestFactory } from "@nestjs/core";
import { ValidationPipe, RequestMethod } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const allowedOrigins = (process.env.CORE_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origins: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("PumpGym API")
    .setDescription("REST API + GraphQL + BFF для фитнес-клуба PumpGym")
    .setVersion("2.0")
    .addTag("auth", "Аутентификация и регистрация")
    .addTag("bff", "Frontend-oriented API")
    .addTag("trainers", "Операции с тренерами")
    .addTag("tariffs", "Операции с тарифами")
    .addTag("timetable", "Операции с расписанием")
    .addTag("bookings", "Операции с заявками")
    .addTag("enrollments", "Записи на занятия и оплаты")
    .addTag("user-tariff", "Подписки пользователей")
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
}

bootstrap().catch((err) => console.error("Bootstrap failed", err));
