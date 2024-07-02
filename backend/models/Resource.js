const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');

// @route    POST api/resources
// @desc     Create a resource
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('url', 'URL is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, description } = req.body;

    try {
      const newResource = new Resource({
        title,
        url,
        description,
        user: req.user.id,
      });

      const resource = await newResource.save();
      res.json(resource);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/resources
// @desc     Get all resources
// @access   Public
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().populate('user', ['name', 'email']);
    res.json(resources);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/resources/:id
// @desc     Get resource by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('user', ['name', 'email']);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    PUT api/resources/:id
// @desc     Update a resource
// @access   Private
router.put('/:id', auth, async (req, res) => {
  const { title, url, description } = req.body;

  const resourceFields = {};
  if (title) resourceFields.title = title;
  if (url) resourceFields.url = url;
  if (description) resourceFields.description = description;

  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    // Check user
    if (resource.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: resourceFields },
      { new: true }
    );

    res.json(resource);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/resources/:id
// @desc     Delete a resource
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    // Check user
    if (resource.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await resource.remove();

    res.json({ msg: 'Resource removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
