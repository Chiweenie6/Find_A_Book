const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // Get a single User
    user: async (parent, { userId }) => {
      return User.findOne({ _id: userId });
    },
    // Can find logged in User without specifically searching for their id by adding context
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("🚫 Must be logged in 🚫");
    },
  },

  Mutation: {
    // Create New User
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    // Make sure the email and password are correct in order to login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("🚫 User Email Not Found 🚫");
      }
    // "isCorrectPassword" from User.js Model to compare and validate password
      const pWord = await user.isCorrectPassword(password);

      if (!pWord) {
        throw new AuthenticationError("🚫 Wrong Password 🚫");
      }

      const token = signToken(user);
      return { token, user };
    },
  },
};
