const router = require('express').Router();
const AuthController = require('../controllers/AuthController');

router.get('/verifyUser', AuthController.verifyUser);
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);


module.exports = router;