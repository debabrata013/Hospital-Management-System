const fs = require('fs');
const path = require('path');
const connectToDatabase = require('../config/database');

let db = null;

async function initializeDatabase() {
  if (db) {
    return db;
  }

  console.log('Initializing database connection...');
  const sequelize = await connectToDatabase();
  const models = {};

  const modelsDir = __dirname;
  console.log(`Loading models from: ${modelsDir}`);

  const files = fs.readdirSync(modelsDir).filter(file => 
    file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js'
  );

  console.log(`Found model files: ${files.join(', ')}`);

  // Temporarily disabled model loading to debug startup crash
  /*
  for (const file of files) {
    try {
      console.log(`Loading model: ${file}`);
      const modelDefinition = require(path.join(modelsDir, file));
      const model = modelDefinition(sequelize);
      models[model.name] = model;
      console.log(`Successfully loaded model: ${model.name}`);
    } catch (error) {
      console.error(`Failed to load model ${file}:`, error);
      throw error;
    }
  }
  */

  console.log('All models loaded. Setting up associations...');
  // Temporarily disabled association to debug startup crash
  /*
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      console.log(`Associating model: ${modelName}`);
      models[modelName].associate(models);
    }
  });
  */

  console.log('Associations complete. Database initialization finished.');
  db = {
    sequelize,
    ...models,
  };

  return db;
}

module.exports = initializeDatabase;
