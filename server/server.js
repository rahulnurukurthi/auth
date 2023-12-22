const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./userSchema');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } = require('graphql');

const app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Global-Voices-Schema', { useNewUrlParser: true, useUnifiedTopology: true });

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parent, args) => User.findById(args.id),
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    registerUser: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const hashedPassword = await bcrypt.hash(args.password, 10);
          const user = new User({ email: args.email, password: hashedPassword });
          return user.save();
        } catch (error) {
          console.error('Error during user registration:', error);
          throw new Error('Registration failed');
        }
      },
    },
    loginUser: {
        type: GraphQLString,
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args) => {
            try {
                const user = await User.findOne({ email: args.email });
      
                if (!user) {
                  console.error('User not found');
                  throw new Error('User not found');
                }
      
                const passwordMatch = await bcrypt.compare(args.password, user.password);
      
                if (!passwordMatch) {
                    console.error('Invalid password');
                  
                    // Increment login attempts and lock the account if needed
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
      
                const token = jwt.sign({ userId: user.id, email: user.email }, 'secret', { expiresIn: '1h' });
                console.log('Login successful. Token:', token);
                return token;
              } catch (error) {
                console.error('Error during user login:', error);
                throw new Error(error);
              }      
          },                 
      },
    },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation,
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/graphql`));
