import { build } from "esbuild";

(async () => {
    console.log("Build...");
    console.time("Build successfully");

    await Promise.all(
        [
            // Web
            {
                platform: "browser",
                outfile: "dist/browser.js",
            },
            // Node
            {
                platform: "node",
                format: "cjs",
                outfile: "dist/node.cjs",
            },
            {
                platform: "node",
                outfile: "dist/node.mjs",
            },
        ].map(async (config) => {
            await build({
                entryPoints: ["src/index.ts"],
                format: "esm",
                bundle: true,
                minify: true,
                keepNames: true,
                sourcemap: true,
                ...config,
            }).catch(() => process.exit(1));
        }),
    );

    console.timeEnd("Build successfully");
})();
