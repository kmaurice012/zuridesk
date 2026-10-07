import mongoose, { type Connection } from "mongoose";

export interface DatabaseConnectionOptions {
  uri: string;
  databaseName: string;
  maxPoolSize?: number;
  serverSelectionTimeoutMs?: number;
}

export type DatabaseHealth = "up" | "down";

let connectionPromise: Promise<Connection> | undefined;

export async function connectDatabase(options: DatabaseConnectionOptions): Promise<Connection> {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return mongoose.connection;
  }

  connectionPromise ??= mongoose
    .connect(options.uri, {
      autoIndex: false,
      dbName: options.databaseName,
      maxPoolSize: options.maxPoolSize ?? 10,
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMs ?? 5_000
    })
    .then((instance) => instance.connection)
    .catch((error: unknown) => {
      connectionPromise = undefined;
      throw error;
    });

  return connectionPromise;
}

export function getDatabaseConnection(): Connection {
  return mongoose.connection;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const database = mongoose.connection.db;

  if (
    mongoose.connection.readyState !== mongoose.ConnectionStates.connected ||
    database === undefined
  ) {
    return "down";
  }

  try {
    await database.admin().ping();
    return "up";
  } catch {
    return "down";
  }
}

export async function disconnectDatabase(): Promise<void> {
  connectionPromise = undefined;

  if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
    await mongoose.disconnect();
  }
}
