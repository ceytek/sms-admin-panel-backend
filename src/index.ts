import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import { UserResolver } from "./resolvers/UserResolver";
import { AppDataSource } from "./data-source";
import "dotenv/config";

async function startServer() {
  // Initialize TypeORM
  try {
    await AppDataSource.initialize();
    console.log("🚀 Data Source has been initialized successfully!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }

  const app: Application = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Build GraphQL Schema
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });

  await server.start();
  server.applyMiddleware({ app });

  // Start server
  const PORT = process.env.PORT || 4004;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
}); 