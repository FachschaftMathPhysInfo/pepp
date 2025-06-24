import { GraphQLClient } from "graphql-request";


const url = process.env.NEXT_PUBLIC_URL ?? "http://localhost:8080";
const endpoint = `${url}/api`;

export const getClient = (sid?: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      SID: sid ?? "",
    },
  });
};
