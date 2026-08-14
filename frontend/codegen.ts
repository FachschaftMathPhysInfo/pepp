
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ["../server/graph/schema.graphqls", "schema.graphqls"],
    documents: "lib/**/*.graphql",
    config: {
	strictScalars: true,
	enumTypes: 'native',
	scalars: {
	    Time: 'string'}
    },

  generates: {
    "lib/gql/generated/": {
	preset: "client",
	config: {
	    enumType: 'native'},
    },
       "lib/gql/generated/schema-types.ts": {
	   plugins: ["typescript"],
    },
  }
};

export default config;
