import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3004",
      "http://192.168.1.179:3000",
    ],
    credentials: true,
  });

  const enableSwagger =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_SWAGGER === "true";

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle("InsureFlow API")
      .setDescription(
        "API de gestão, cotações, carteira e agenda para mediação de seguros",
      )
      .setVersion("2.4")
      .build();

    SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(Number(process.env.PORT || 3001), "0.0.0.0");
}

void bootstrap();
