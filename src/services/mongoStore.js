const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'templates';

let client;
let db;
let templatesCollection;

/**
 * Connect to the MongoDB database and initialize the collection.
 */
async function connect() {
  if (!client) {
    try {
      client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(dbName);
      templatesCollection = db.collection(collectionName);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
      throw new Error('Database connection error');
    }
  }
}

/**
 * Disconnect from the MongoDB database.
 */
async function disconnect() {
  if (client) {
    try {
      await client.close();
      client = null;
      db = null;
      templatesCollection = null;
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error.message);
    }
  }
}

/**
 * Get all templates with optional filters and options.
 * @param {Object} filter - MongoDB filter object.
 * @param {Object} options - MongoDB query options.
 * @returns {Array} List of templates.
 */
async function getAllTemplates(filter = {}, options = {}) {
  await connect();
  try {
    return await templatesCollection
      .find(filter, options)
      .sort({ updatedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    throw new Error('Failed to fetch templates');
  }
}

/**
 * Get a template by its ID.
 * @param {string} id - Template ID.
 * @returns {Object|null} Template document or null if not found.
 */
async function getTemplateById(id) {
  await connect();
  try {
    return await templatesCollection.findOne({ _id: id });
  } catch (error) {
    console.error(`Error fetching template with ID ${id}:`, error.message);
    throw new Error('Failed to fetch template');
  }
}

/**
 * Get templates by category.
 * @param {string} category - The category to filter templates by.
 * @returns {Array} List of templates in the specified category.
 */
async function getTemplatesByCategory(category) {
  await connect();
  try {
    return await templatesCollection
      .find({ category })
      .sort({ updatedAt: -1 })
      .toArray();
  } catch (error) {
    console.error(`Error fetching templates for category ${category}:`, error.message);
    throw new Error('Failed to fetch templates by category');
  }
}
/**
 * Add a new template to the database.
 * @param {Object} templateData - Template data to insert.
 * @returns {Object} Inserted template document.
 */
async function addTemplate(templateData) {
  await connect();
  try {
    const doc = {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await templatesCollection.insertOne(doc);
    return doc;
  } catch (error) {
    console.error('Error adding template:', error.message);
    throw new Error('Failed to add template');
  }
}

/**
 * Update an existing template by its ID.
 * @param {string} id - Template ID.
 * @param {Object} updates - Fields to update.
 * @returns {Object|null} Updated template document or null if not found.
 */
async function updateTemplate(id, updates) {
  await connect();
  try {
    updates.updatedAt = new Date();
    const result = await templatesCollection.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result.value;
  } catch (error) {
    console.error(`Error updating template with ID ${id}:`, error.message);
    throw new Error('Failed to update template');
  }
}

/**
 * Delete a template by its ID.
 * @param {string} id - Template ID.
 * @returns {Object} Deleted template ID.
 */
async function deleteTemplate(id) {
  await connect();
  try {
    const result = await templatesCollection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new Error('Template not found');
    }
    return { _id: id };
  } catch (error) {
    console.error(`Error deleting template with ID ${id}:`, error.message);
    throw new Error('Failed to delete template');
  }
}

module.exports = {
  connect,
  disconnect,
  getAllTemplates,
  getTemplateById,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplatesByCategory
};