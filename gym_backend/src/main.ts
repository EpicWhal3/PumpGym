import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: [`http://localhost:3000`],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}

bootstrap()
  .then(() => console.log("Bootstrap completed"))
  .catch((err) => console.error("Bootstrap failed", err));
