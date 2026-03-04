# eSparkTools

## migrate-middleware-to-proxy.sh

Migrates a Next.js project from the deprecated `middleware.ts`/`middleware.js` convention to the new `proxy.ts`/`proxy.js` convention introduced in [Next.js 16](https://nextjs.org/docs/messages/middleware-to-proxy).

### What it does

1. Finds `middleware.ts` or `middleware.js` in the project root or `src/`
2. Renames the file to `proxy.ts` / `proxy.js`
3. Renames the exported `middleware` function to `proxy`
4. Converts the named export to a default export

### Usage

```bash
./migrate-middleware-to-proxy.sh [project-directory]
```

If no directory is given, the current directory is used.

### Alternatively: use the official Next.js codemod

```bash
npx @next/codemod@canary middleware-to-proxy .
```