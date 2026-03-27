module.exports = {
  bkkHonestApi: {
    input: {
      target: 'http://localhost:3000/api-json', // Or whatever path returns your OpenAPI spec from NestJS
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints.ts',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mock: true,
      prettier: true,
      override: {
        mutator: {
          path: 'src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
