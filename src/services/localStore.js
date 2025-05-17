// src/services/localStore.js
const path = require('path');
const fs = require('fs').promises;

async function saveFile(file) {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  // express-fileupload gives you `file.name` and a `.mv()` method,
  // but if you prefer buffer-based approach:
  const filename = `${Date.now()}-${file.name}`;
  const dest = path.join(uploadsDir, filename);

  // file.mv is callback-based; wrap in a promise:
  await new Promise((resolve, reject) => {
    file.mv(dest, err => (err ? reject(err) : resolve()));
  });

  // return a path or URL that your front-end can fetch:
  return `/uploads/${filename}`;
}

/**
 * Save JSON content to the file path specified in metadata.fileUrl.
 * @param {Object} data - The JSON object containing metadata and content.
 */
async function saveJsonAsfile(data) {
  if (!data.metadata || !data.metadata.fileUrl) {
    throw new Error('Invalid data: metadata or fileUrl is missing');
  }

  const fileUrl = data.metadata.fileUrl;
  const category = data.metadata.category || ''; // Default category if not provided
  const filename =  category +"_"+path.basename(fileUrl); // Extract the file name from the fileUrl
  const filepath = path.resolve(__dirname, '../uploads', filename); // Resolve the full path

  // Combine metadata and content into a single object
  const fileData = {
    metadata: data.metadata,
    content: data.content,
  };

  // Write the JSON data to the specified file
  await fs.writeFile(filepath, JSON.stringify(fileData, null, 2), 'utf-8');
  return filepath;
}


async function getFile(fileUrl) {
  const filename = path.basename(fileUrl);
  const filepath = path.resolve(__dirname, '../uploads', filename);
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}


module.exports = { saveFile, getFile, saveJsonAsfile };
