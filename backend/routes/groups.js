const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Group = require('../models/Group');

// @route    POST api/groups
// @desc     Create a group
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
      const newGroup = new Group({
        name,
        description,
        members: [{ user: req.user.id }],
      });

      const group = await newGroup.save();
      res.json(group);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/groups
// @desc     Get all groups
// @access   Public
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('members.user', ['name', 'email']);
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/groups/:id
// @desc     Get group by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.user', ['name', 'email']);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    PUT api/groups/:id
// @desc     Update a group
// @access   Private
router.put('/:id', auth, async (req, res) => {
  const { name, description } = req.body;

  const groupFields = {};
  if (name) groupFields.name = name;
  if (description) groupFields.description = description;

  try {
    let group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check user
    if (!group.members.some((member) => member.user.toString() === req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    group = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: groupFields },
      { new: true }
    );

    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/groups/:id
// @desc     Delete a group
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check user
    if (!group.members.some((member) => member.user.toString() === req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await group.remove();

    res.json({ msg: 'Group removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
