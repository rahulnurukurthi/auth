// Import required modules and packages
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./userSchema');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } = require('graphql');

// Create an Express application
const app = express();
app.use(cors());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/Global-Voices-Schema', { useNewUrlParser: true, useUnifiedTopology: true });

// Define GraphQL User Type
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

// GraphQL Query
const AuthenticationQuery = new GraphQLObjectType({
  name: 'AuthenticationQueryType',
  fields: {
    // GraphQL query to find a user by ID
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parent, args) => User.findById(args.id),
    },
  },
});

// GraphQL Mutation for user registration and login
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // GraphQL mutation for user registration
    registerUser: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          // Hash the user's password before saving to the database
          const hashedPassword = await bcrypt.hash(args.password, 10);
          const user = new User({ email: args.email, password: hashedPassword });
          return user.save();
        } catch (error) {
          // Handle registration error and throw a custom error message
          console.error('Error during user registration:', error);
          throw new Error('Registration failed');
        }
      },
    },
    // GraphQL mutation for user login
    loginUser: {
        type: GraphQLString,
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args) => {
            try {
                // Find the user by email in the database
                const user = await User.findOne({ email: args.email });
      
                // If the user is not found, throw an error
                if (!user) {
                  console.error('User not found');
                  throw new Error('User not found');
                }
      
                // Compare the provided password with the hashed password in the database
                const passwordMatch = await bcrypt.compare(args.password, user.password);
      
                // If the password does not match, increment login attempts and lock the account if needed
                if (!passwordMatch) {
                    console.error('Invalid password');
                    user.loginAttempts += 1;
                    if (user.loginAttempts >= 5) {
                      console.error('Account locked due to multiple failed login attempts');
                      throw new Error('Account locked due to multiple failed login attempts');
                    }
                  
                    await user.save();
                    throw new Error('Invalid password');
                  }
      
                // Reset login attempts on successful login
                user.loginAttempts = 0;
                await user.save();
      
                // Generate a JWT token for successful login
                const token = jwt.sign({ userId: user.id, email: user.email }, 'secret', { expiresIn: '1h' });
                console.log('Login successful. Token:', token);
                return token;
              } catch (error) {
                // Handle login error and throw a custom error message
                console.error('Error during user login:', error);
                throw new Error(error);
              }      
          },                 
      },
    },
});

// Create a GraphQL schema with defined AuthenticationQuery and Mutation
const schema = new GraphQLSchema({
  query: AuthenticationQuery,
  mutation,
});

// Configure Express to use GraphQL middleware
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// Define the server's port, using the provided port or a default
const PORT = process.env.PORT || 4000;

// Start the server and log the server's URL to the console
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
