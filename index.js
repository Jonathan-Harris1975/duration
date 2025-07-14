import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import tmp from 'tmp';

const app = express();
const port = process.env.PORT || 3000;
const ffprobe = promisify(exec);

const downloadTempFile = async (url) => {
  const tmpFile = tmp.fileSync({ postfix: '.mp3' });
  const writer = fs.createWriteStream(tmpFile.name);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return tmpFile.name;
};

app.get('/duration', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const path = await downloadTempFile(url);
    const { stdout } = await ffprobe(`ffprobe -i "${path}" -show_entries format=duration -v quiet -of csv="p=0"`);
    fs.unlinkSync(path);
    res.json({ duration: parseFloat(stdout.trim()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get duration' });
  }
});

app.listen(port, () => {
  console.log(`Duration service running on port ${port}`);
});
