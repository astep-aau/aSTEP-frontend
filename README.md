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
- [ShadCn Docs](https://ui.shadcn.com/) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment cumming soon!

Group 11 is currently working on kubernetes setup for project

```mermaid
architecture-beta
    group ks(cloud)[Kubernetes]
    service nextjs(server)[NextJS Server] in ks

    service group11service(server)[REST service Group 11] in ks   
    service group11database(database)[Database Group 11]

    service othergroupservice(server)[REST service other group] in ks   
    service othergroupdatabase(database)[Database other group]
    
    nextjs:R -- L:group11service
    group11service:R -- L:group11database

    nextjs:B -- T:othergroupservice
    othergroupservice:B -- T:othergroupdatabase
```
