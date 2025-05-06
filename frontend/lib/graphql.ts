import { GraphQLClient } from "graphql-request";

const getEndpoint = () => {
  if (typeof window !== "undefined") {
    return new URL("/api", window.location.origin).toString();
  }
  return "";
};

export const getClient = (sid?: string) => {
  return new GraphQLClient(getEndpoint(), {
    headers: {
      SID: sid ?? "",
    },
  });
};
