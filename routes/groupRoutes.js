const express = require('express');
const {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} = require('../controllers/groupController');


const router = express.Router();

//@Route /api/groups
//@Desc Create a new group
router.post('/', createGroup);

// Get all groups
router.get('/', getAllGroups);

// Get group by ID
router.get('/:groupId', getGroupById);

// Update a group
router.put('/:groupId', updateGroup);

// Delete a group
router.delete('/:groupId', deleteGroup);

module.exports = router;
