import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to download image");

    const contentType = response.headers.get("content-type") || '';
    const buffer = await response.buffer();

    if (contentType.includes("svg")) {
      // Es SVG: lo convertimos
      const pngBuffer = await sharp(buffer).png().toBuffer();
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(pngBuffer);
    } else {
      // No es SVG: reenviamos tal cual
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(buffer);
    }

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Error fetching or converting image");
  }
}
