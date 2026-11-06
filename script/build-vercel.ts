import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { cp, mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { applySiteUrl } from "./public-files";

/**
 * Builds the site in Vercel's Build Output format: the frontend as static files,
 * and the API as one bundled function, so nothing depends on Vercel compiling
 * the server itself. Specification: https://vercel.com/docs/build-output-api
 */
const OUTPUT = ".vercel/output";
const FUNCTION_DIR = path.join(OUTPUT, "functions/api/handler.func");

/** Optional MongoDB add-ons this project doesn't use. The driver loads them only if asked. */
const OPTIONAL_DRIVER_PACKAGES = [
  "kerberos",
  "@mongodb-js/zstd",
  "@aws-sdk/credential-providers",
  "gcp-metadata",
  "snappy",
  "socks",
  "aws4",
  "mongodb-client-encryption",
];

const config = {
  version: 3,
  routes: [
    {
      src: "^/assets/(.*)$",
      headers: { "cache-control": "public, max-age=31536000, immutable" },
      continue: true,
    },
    { src: "^/api/(.*)$", dest: "/api/handler?path=$1" },
    { handle: "filesystem" },
    // Pages like /work/phyhanagro are handled in the browser.
    { src: "^/(.*)$", dest: "/index.html" },
  ],
};

const functionConfig = {
  runtime: "nodejs22.x",
  handler: "index.cjs",
  launcherType: "Nodejs",
  shouldAddHelpers: false,
  maxDuration: 30,
};

async function buildForVercel() {
  await rm(OUTPUT, { recursive: true, force: true });
  await rm("dist/public", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();
  const siteUrl = await applySiteUrl("dist/public");
  console.log(`site address: ${siteUrl}`);

  console.log("building API function...");
  await mkdir(FUNCTION_DIR, { recursive: true });
  await esbuild({
    entryPoints: ["server/vercel.ts"],
    outfile: path.join(FUNCTION_DIR, "index.cjs"),
    platform: "node",
    target: "node22",
    format: "cjs",
    bundle: true,
    minify: true,
    define: { "process.env.NODE_ENV": '"production"' },
    external: OPTIONAL_DRIVER_PACKAGES,
    // Vercel calls the exported function itself, not a `default` property.
    footer: { js: "module.exports = module.exports.default;" },
    logLevel: "info",
  });
  await writeFile(path.join(FUNCTION_DIR, ".vc-config.json"), JSON.stringify(functionConfig, null, 2));

  await cp("dist/public", path.join(OUTPUT, "static"), { recursive: true });
  await writeFile(path.join(OUTPUT, "config.json"), JSON.stringify(config, null, 2));
  console.log(`wrote ${OUTPUT}`);
}

buildForVercel().catch((error) => {
  console.error(error);
  process.exit(1);
});
