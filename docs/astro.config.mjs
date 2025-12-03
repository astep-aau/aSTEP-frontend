// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  base: '/docs',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'aSTEP Docs',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/astep-aau/aSTEP-docs' }],
      sidebar: [
        {
          label: 'Cross Group Work',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'cross-group' },
            { label: 'Frontend', slug: 'cross-group/frontend' },
          ],
        },
        {
          label: 'Group 2: Forecasting',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'group-2' },
          ],
        },
        {
          label: 'Group 3: Travel Time Estimation',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'group-3' },
            { label: 'Project Architecture', slug: 'group-3/project-architecture' },
            { label: 'Frontend to Backend Communication', slug: 'group-3/frontend-backend-communication' },
            { label: 'State Service', slug: 'group-3/state-service' },
            { label: 'Translator Service', slug: 'group-3/translator-service' },
            { label: 'Route Estimation Service', slug: 'group-3/route-estimation-service' },
            { label: 'Training Service', slug: 'group-3/training-service' },
            { label: 'AI-Lab', slug: 'group-3/ailab' },
          ],
        },
        {
          label: 'Group 6: Attributes Prediction',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'group-6' },
          ],
        },
        {
          label: 'Group 9: Outlier Detection',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'group-9' },
          ],
        },
        {
          label: 'Group 11: Travel Time Estimation',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Overview', slug: 'group-11' },
            { label: 'Map Matching', slug: 'group-11/map-matching' },
            { label: 'Model', slug: 'group-11/model' },
            { label: 'Pathfinding', slug: 'group-11/pathfinding' },
          ],
        },
      ],
    }),
  ],
});
