import { defineConfig } from 'orval';

export default defineConfig({
  bkkHonestApi: {
    input: {
      target: 'http://localhost:3000/api-json', 
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints.ts',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        query: {
          useQuery: true,
          useInfinite: false,
        }
      },
    },
  },
});
