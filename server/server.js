const express = require("express");
const path = require("path");
const db = require("./config/connection");

// Adding Apollo Server
const { ApolloServer } = require("apollo-server-express");
// Importing the two parts of the GraphQL schema
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Using Apollo Servernpm run build
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// New instance of an Apollo server created with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(
        `🎈 Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(`🌍 Now listening on localhost:${PORT}`);
    });
  });
};

// Start the servers by calling async function
startApolloServer(typeDefs, resolvers);
