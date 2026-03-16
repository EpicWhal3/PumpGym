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

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
bootstrap()
  .then(() => console.log("Bootstrap completed"))
  .catch((e) => console.error("Bootstrap failed", e));
