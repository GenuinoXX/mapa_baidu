import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import sharp from 'sharp';

const CACHE_DIR = path.resolve('./public/icons');

export default async function handler(req, res) {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing `url` param');

  const fileName = encodeURIComponent(imageUrl) + '.png';
  const cachePath = path.join(CACHE_DIR, fileName);

  try {
    // Revisa si ya está en caché
    try {
      const cached = await fs.readFile(cachePath);
      res.setHeader('Content-Type', 'image/png');
      return res.status(200).send(cached);
    } catch (_) {}

    // Si no está en caché, intenta descargar
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error("Error descargando imagen");

    const svgBuffer = await response.buffer();
    const pngBuffer = await sharp(svgBuffer)
      .resize(64, 64)
      .png()
      .toBuffer();

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, pngBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(pngBuffer);
  } catch (err) {
    console.error("❌ Error cambiando imagen:", err.message);
    res.status(500).send('Error');
  }
}