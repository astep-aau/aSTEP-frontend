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

## Deployment coming soon!

Group 11 is currently working on kubernetes setup for project

```mermaid
architecture-beta
    group ks(cloud)[Kubernetes]
    service nextjs(server)[NextJS Server] in ks
    service group11service(server)[REST service Group 11] in ks   
    service group2service(server)[REST service Group 2] in ks   
    service group3service(server)[REST service Group 3] in ks   
    service group6service(server)[REST service Group 6] in ks   
    service group9service(server)[REST service Group 9] in ks   
    service database(database)[Database]
    junction junction1
    junction junction2
    junction junction3
    junction junction4
    junction junction5
    junction junction6

    junction junction8
    junction junction9
    junction junction10
    junction junction11
    junction junction12

    group2service:T -- B:junction8
    group3service:T -- B:junction9
    group6service:T -- B:junction10
    group9service:T -- B:junction11
    group11service:T -- B:junction12

    junction8:L -- R:junction9
    junction9:L -- R:junction10
    junction10:L -- R:junction11
    junction11:L -- R:junction12

    junction10:T -- B:nextjs

    group2service:B -- T:junction5
    group3service:B -- T:junction4
    group6service:B -- T:junction3
    group9service:B -- T:junction2
    group11service:B -- T:junction1
    database:T -- B:junction3

    junction1:R -- L:junction2
    junction2:R -- L:junction3
    junction3:R -- L:junction4
    junction4:R -- L:junction5
```


