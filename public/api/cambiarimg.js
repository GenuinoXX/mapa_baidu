import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('Missing `url` parameter');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to download image");

    const svgBuffer = await response.buffer();

    const pngBuffer = await sharp(svgBuffer)
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(pngBuffer);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error converting image');
  }
}