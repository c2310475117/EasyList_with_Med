// backend/routes/userRoutes.js

import express from 'express';
import User from '../models/userModel.js';
//import List from '../models/listModel.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, verifyToken, authMiddleware } from '../auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Registrierung eines neuen Benutzers
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Request body:', req.body);

  if (!username || !email || !password) {
    console.log('Missing fields during registration');
    return res.status(400).json({ message: 'Name, Email, and Password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { [Op.or]: [{ user_name: username }, { email: email }] } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Creating user:', { username, email });

    const user = await User.create({ user_name: username, email, password_hash: hashedPassword });

    console.log('User created successfully:', user);

    //const listName = "default List";
    //const defaultList = await List.create({ // create erwartet ein Objekt !
      //list_name: listName,
      //l_user_id: user.user_id }) 
   // console.log('Default list created for user:', defaultList);

    const token = generateAccessToken(user.user_id);

    res.status(201).json({ token, l_user_id: user.user_id, userName: user.user_name}); // Geändert: Senden von JSON-Antworten statt Redirect
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error', error: error.errors ? error.errors[0].message : error.message });
  }
});

// Anmeldung eines Benutzers
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and Password are required' });
  }

  try {
    const user = await User.findOne({ where: { user_name: username } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateAccessToken(user.user_id);
    console.log('Login successful, token generated:', token);
    res.status(200).json({ token, userId: user.user_id, userName: user.user_name }); // Geändert: Senden von JSON-Antworten statt Redirect
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
