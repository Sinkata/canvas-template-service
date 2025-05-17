const express = require('express');
const router = express.Router();
const mongoStore = require('../services/mongoStore');
const fileStore = require('../services/fileStore');

// Utility to handle async errors
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper to validate required query parameters
const validateQueryParam = (param, res) => {
  if (!param) {
    res.status(400).json({ error: `query param is required` });
    return false;
  }
  return true;
};

// Routes

// POST /templates - Create a new template
router.post(
  '/content',
  asyncHandler(async (req, res) => {
    const metadata = req?.body?.metadata;
    if (req) {
      metadata.fileUrl = await fileStore.saveJsonToFile(req?.body);
    }
    const md = await mongoStore.addTemplate(metadata);
    res.status(201).json(md);
  })
);

// GET /templates/all - Get all templates
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const templates = await mongoStore.getAllTemplates();
    res.json(templates);
  })
);

// GET /templates - Get a template by ID
router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!validateQueryParam(req.query.id, res)) return;
    const tpl = await mongoStore.getTemplateById(req.query.id);
    if (!tpl) return res.status(404).json({ error: 'Template not found' });
    res.json(tpl);
  })
);

// GET /templates/content - Get content for one or more templates by ID(s)
router.get(
  '/content',
  asyncHandler(async (req, res) => {
    const ids = req.query.id;
    if (!ids) {
      return res.status(400).json({ error: 'Query parameter "id" is required' });
    }

    // Split comma-separated IDs into an array
    const idArray = ids.split(',').map(id => id.trim());

    const templateContents = await Promise.all(
      idArray.map(async id => {
        const metadata = await mongoStore.getTemplateById(id);
        if (!metadata || !metadata.fileUrl) {
          return null; // Return null if metadata or fileUrl is missing
        }
        return await fileStore.getFile(metadata.fileUrl);
      })
    );

    // Filter out null values and return only the contents
    res.json(templateContents.filter(content => content !== null));
  })
);

// GET /templates/all/content - Get metadata and content for all templates
router.get(
  '/all/content',
  asyncHandler(async (req, res) => {
    const metadataList = await mongoStore.getAllTemplates();
    const templateContents = await Promise.all(
      metadataList.map(async meta => {
        return meta.fileUrl ? await fileStore.getFile(meta.fileUrl) : null;
      })
    );
    res.json(templateContents.filter(content => content !== null)); // Filter out null values
  })
);

// GET /templates/category - Get templates by category
router.get(
  '/category',
  asyncHandler(async (req, res) => {
    if (!validateQueryParam(req.query.category, res)) return;
    const templates = await mongoStore.getTemplatesByCategory(req.query.category);
    res.json(templates);
  })
);

// PUT /templates - Update a template by ID
router.put(
  '/',
  asyncHandler(async (req, res) => {
    if (!validateQueryParam(req.query.id, res)) return;
    const updates = req.body;
    if (req.files?.templateFile) {
      updates.fileUrl = await fileStore.saveFile(req.files.templateFile);
    }
    const updated = await mongoStore.updateTemplate(req.query.id, updates);
    res.json(updated);
  })
);

// DELETE /templates - Delete a template by ID
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    if (!validateQueryParam(req.query.id, res)) return;
    await mongoStore.deleteTemplate(req.query.id);
    res.status(204).end();
  })
);

module.exports = router;