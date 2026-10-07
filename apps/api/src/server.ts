import { checkDatabaseHealth, connectDatabase, disconnectDatabase } from "@zuridesk/db";

import { buildApp } from "./app";
import { parseApiEnvironment } from "./config/env";

const environment = parseApiEnvironment(process.env);

await connectDatabase({
  uri: environment.MONGODB_URI,
  databaseName: environment.MONGODB_DB_NAME
});

const app = await buildApp({
  allowedOrigins: environment.WEB_ORIGINS,
  checkDatabase: checkDatabaseHealth,
  environment: environment.NODE_ENV,
  logger: {
    level: environment.LOG_LEVEL,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "request.headers.authorization",
        "request.headers.cookie",
        "*.password",
        "*.token",
        "*.otp",
        "*.uri"
      ],
      censor: "[REDACTED]"
    }
  }
});

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  app.log.info({ signal }, "graceful shutdown started");
  await app.close();
  await disconnectDatabase();
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}

await app.listen({ host: environment.API_HOST, port: environment.API_PORT });
