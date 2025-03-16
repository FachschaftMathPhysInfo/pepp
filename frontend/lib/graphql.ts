import { GraphQLClient } from "graphql-request";

const endpoint = "http://localhost:8080/api";

export const getClient = (sid?: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      SID: sid ?? "",
    },
  });
}
