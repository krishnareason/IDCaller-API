import express from 'express';
import { registerUser, loginUser, addContact, markSpam, searchByName, searchByNumber } from '../control/userControl.js';
import { protect } from '../midleware/authMidleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/contact', protect, addContact);

router.post('/spam', protect, markSpam);

router.get('/search/name', protect, searchByName);

router.get('/search/number', protect, searchByNumber);

export default router;