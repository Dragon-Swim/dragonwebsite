/**
 * build-single.mjs — 把 Worker 打成**一个文件**,用于没有 wrangler 时的退路。
 *
 * 用途:Cloudflare Dashboard → Workers & Pages → Create → 编辑代码 → 粘贴 → Deploy。
 * 正常流程仍然是 `npx wrangler deploy`,这个只在 wrangler 出问题(或临时改一行想快速上线)时用。
 *
 * 跑法(在 worker/ 目录):
 *   node build-single.mjs        → dist/worker.js
 */
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: 'dist/worker.js',
  logLevel: 'info',
});
