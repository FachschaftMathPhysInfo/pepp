import { GraphQLClient } from 'graphql-request';
import {env} from 'process';

var endpoint = 'http://localhost:8080/api'

export const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: "X-API-Key " + env.API_KEY
  },
});
