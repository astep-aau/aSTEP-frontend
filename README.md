# The big data main

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js or ShadCn, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Shadcn Docs](https://ui.shadcn.com/) - Shadcn Documentation.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment coming soon!

Group 11 is currently working on kubernetes setup for project

```mermaid
architecture-beta
    group ks(cloud)[Kubernetes]
    group tte(cloud)[TTE] in ks
    group ot(cloud)[OT] in ks
    service nextjs(server)[NextJS Server] in ks
    service group11service(server)[REST service Group 11] in tte 
    service group2service(server)[REST service Group 2] in ot   
    service group3service(server)[REST service Group 3] in tte   
    service group6service(server)[REST service Group 6] in tte   
    service group9service(server)[REST service Group 9] in ot   
    service ttedatabase(database)[TTE Database] in tte
    service otherdatabase(database)[Other Database] in ot

    group3service:L -- R:ttedatabase
    group6service:L -- R:ttedatabase
    group11service:L -- R:ttedatabase

    group3service:L -- R:nextjs
    group6service:L -- R:nextjs
    group11service:L -- R:nextjs

    group2service:R-- L:otherdatabase
    group9service:R -- L:otherdatabase

    group2service:R-- L:nextjs
    group9service:R -- L:nextjs
```


