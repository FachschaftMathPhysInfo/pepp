
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ["../server/graph/schema.graphqls", "schema.graphqls"],
  documents: "lib/**/*.graphql",
  generates: {
    "lib/gql/generated/": {
      preset: "client",
    }
  }
};

export default config;
