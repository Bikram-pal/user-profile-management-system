const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Own profile routes
router.route('/profile').get(c.getProfile).put(c.updateProfile).delete(c.deleteAccount);
router.put('/password', c.changePassword);
router.post('/avatar', upload.single('avatar'), c.uploadAvatar);
router.delete('/avatar', c.removeAvatar);

// Admin routes (note: /stats must be before /:id)
router.get('/stats', adminOnly, c.getStats);
router.get('/', adminOnly, c.listUsers);
router.route('/:id').get(adminOnly, c.getUser).put(adminOnly, c.updateUserByAdmin).delete(adminOnly, c.deleteUserByAdmin);

module.exports = router;
