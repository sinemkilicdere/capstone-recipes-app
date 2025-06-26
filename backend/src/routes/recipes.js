const express = require('express');
const router = express.Router();
const { Recipe } = require('../db/models');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'capstone-secret';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
}

// GET /recipes (public)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Fetch error' });
  }
});

// POST /recipes (auth required)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, image, category } = req.body;
  try {
    const recipe = await Recipe.create({
      title,
      description,
      image,
      category,
      userId: req.userId
    });
    res.status(201).json(recipe);
  } catch (err) {
    console.error('Creation error:', err);
    res.status(500).json({ error: 'Creation failed' });
  }
});

// PUT /recipes/:id (auth required + ownership check)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, image, category } = req.body;

  try {
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId !== req.userId) return res.status(403).json({ error: 'Not allowed' });

    await recipe.update({ title, description, image, category });
    res.json(recipe);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /recipes/:id (auth required + ownership check)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId !== req.userId) return res.status(403).json({ error: 'Not allowed' });

    await recipe.destroy();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
