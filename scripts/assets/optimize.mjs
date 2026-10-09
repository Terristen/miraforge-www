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
  },
  features: {
    folder: 'features',
    files: [
      'manuscript.png',
      'lore.png',
      'timeline.png',
      'plot.png',
      'graph.png',
      'knowledge.png',
      'archivist.png',
      'exports.png',
      'editing.png',
      'multiple_books.png',
    ],
    idPrefix: 'feature_',
    variants: [{ width: 640, formats: ['avif', 'webp'] }],
    quality: { avif: 50, webp: 75 }
  },
  archive: {
    folder: 'archive',
    files: [
      'archive.png',
      'characters.png',
      'manuscript.png',
      'notes.png',
      'places.png',
      'timelines.png',
    ],
    idPrefix: 'archive_',
    variants: [{ width: 640, formats: ['avif', 'webp'] }],
    quality: { avif: 50, webp: 75 }
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

async function processListed(config, manifest) {
  for (const file of config.files) {
    const id = `${config.idPrefix || ''}${path.parse(file).name}`;
    manifest[id] = [];
    for (const variant of config.variants) {
      await processAsset(path.join(SOURCE_ROOT, config.folder, file), variant, config, id);
      manifest[id].push({ width: variant.width || 'original', formats: variant.formats });
    }
  }
}

async function run() {
  await ensureDir(OUTPUT_ROOT);
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;
  const manifestPath = path.join(OUTPUT_ROOT, 'manifest.json');
  const manifest = only ? JSON.parse(await fs.readFile(manifestPath, 'utf8')) : {};

  const unknown = only?.filter((name) => !ASSET_CONFIG[name]) ?? [];
  if (unknown.length) throw new Error(`Unknown --only group: ${unknown.join(', ')}`);

  const selected = (name) => !only || only.includes(name);

  if (selected('heros')) {
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
  }

  if (selected('textures')) {
    for (const file of ASSET_CONFIG.textures.files) {
      const id = path.parse(file).name;
      manifest[id] = [];
      for (const variant of ASSET_CONFIG.textures.variants) {
        await processAsset(path.join(SOURCE_ROOT, file), variant, ASSET_CONFIG.textures, id);
        manifest[id].push({ width: 'original', formats: variant.formats });
      }
    }
  }

  if (selected('widgets')) {
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
  }

  if (selected('features')) await processListed(ASSET_CONFIG.features, manifest);
  if (selected('archive')) await processListed(ASSET_CONFIG.archive, manifest);

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Asset optimization complete.');
}

run().catch(console.error);

