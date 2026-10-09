import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

const SOURCE_ROOT = './design/reference';
const OUTPUT_ROOT = './public/assets/optimized';

const ASSET_CONFIG = {
  heros: {
    folder: 'heros',
    variants: [
      { width: 1920, formats: ['avif', 'webp'] },
      { width: 1024, formats: ['avif', 'webp'] },
      { width: 640, formats: ['avif', 'webp'] },
    ],
    quality: { avif: 50, webp: 75 }
  },
  textures: {
    folder: '',
    files: ['parchment_old.png', 'Parchment_older.png', 'iron_surface.png', 'nodes_and_edges.png'],
    variants: [{ formats: ['avif', 'webp'] }],
    quality: { avif: 60, webp: 75 }
  },
  widgets: {
    folder: 'widgets',
    variants: [{ width: 200, formats: ['webp'] }],
    quality: { webp: 80 }
  }
};

async function ensureDir(dir) {
  try { await fs.access(dir); } catch { await fs.mkdir(dir, { recursive: true }); }
}

async function processAsset(sourcePath, variant, config, assetId) {
  const start = performance.now();
  for (const format of variant.formats) {
    const filename = `${assetId}__${variant.width ? variant.width + 'w' : 'orig'}.${format}`;
    const currentPath = path.join(OUTPUT_ROOT, filename);
    let pipeline = sharp(sourcePath).resize(variant.width || null);

      if (format === 'avif') pipeline = pipeline.avif({ quality: config.quality?.avif || 60 });
      if (format === 'webp') pipeline = pipeline.webp({ quality: config.quality?.webp || 80 });
    await pipeline.toFile(currentPath);
  }
  console.log(`Processed ${assetId} in ${Math.round(performance.now() - start)}ms`);
}

async function run() {
  await ensureDir(OUTPUT_ROOT);
  const manifest = {};

  // Heros
  const heroFiles = await fs.readdir(path.join(SOURCE_ROOT, ASSET_CONFIG.heros.folder));
  for (const file of heroFiles) {
    if (!file.endsWith('.png')) continue;
    const id = path.parse(file).name;
    manifest[id] = [];
    for (const variant of ASSET_CONFIG.heros.variants) {
      await processAsset(path.join(SOURCE_ROOT, ASSET_CONFIG.heros.folder, file), variant, ASSET_CONFIG.heros, id);
      manifest[id].push({ width: variant.width, formats: variant.formats });
    }
  }

  // Textures
  for (const file of ASSET_CONFIG.textures.files) {
    const id = path.parse(file).name;
    manifest[id] = [];
    for (const variant of ASSET_CONFIG.textures.variants) {
      await processAsset(path.join(SOURCE_ROOT, file), variant, ASSET_CONFIG.textures, id);
      manifest[id].push({ width: 'original', formats: variant.formats });
    }
  }

  // Widgets
  const widgetFiles = await fs.readdir(path.join(SOURCE_ROOT, ASSET_CONFIG.widgets.folder));
  for (const file of widgetFiles) {
    if (!file.endsWith('.png')) continue;
    const id = path.parse(file).name;
    manifest[id] = [];
    for (const variant of ASSET_CONFIG.widgets.variants) {
      await processAsset(path.join(SOURCE_ROOT, ASSET_CONFIG.widgets.folder, file), variant, ASSET_CONFIG.widgets, id);
      manifest[id].push({ width: 'original', formats: variant.formats });
    }
  }

  await fs.writeFile(path.join(OUTPUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Asset optimization complete.');
}

run().catch(console.error);

