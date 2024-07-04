import { GraphQLClient } from 'graphql-request';

const endpoint = 'http://localhost:8080/api';

export const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: "Bearer bomeguwj6hdbi0u0osm3o"
  },
});