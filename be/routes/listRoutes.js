// backend/routes/listRoutes.js

import express from 'express';
import Word from '../models/wordModel.js';
import List from '../models/listModel.js';
import Icon from '../models/iconModel.js';
import { getIconDatafromAPI } from '../controller/IconApi.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Funktion zur Erstellung einer Liste für einen Benutzer
const createList = async (listName, userId) => {
  try {
    console.log(`Creating list with name: ${listName} for userId: ${userId}`);
    const newList = await List.create({
      list_name: listName,
      l_user_id: userId,
    });
    console.log('List created successfully:', newList);
    return newList;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

router.post('/', authMiddleware, async (req, res) => {
  const { listName } = req.body;
  const userId = req.user.userId; // Benutzer-ID aus dem Token

  try {
    console.log(`Creating list in database for userId: ${userId} with listName: ${listName}`);
    // Hier erfolgt die Erstellung der Liste in der Datenbank
    const newList = await createList(listName, userId);
    res.status(201).json(newList);
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Liste' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const userLists = await List.findAll({ where: { l_user_id: userId } });
    console.log('User lists fetched successfully.');
    res.status(200).json({ lists: userLists });
  } catch (error) {
    console.error('Fehler beim Abrufen der Listen des Benutzers:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Abrufen der Listen' });
  }
});

router.post('/:listId/words', authMiddleware, async (req, res) => {
  console.log('Word Name:', req.body.keyword);
  const { listId } = req.params;
  const { keyword } = req.body;

  try {
    const word = await Word.create({
      word_name: keyword,
      w_list_id: listId,
    });

    res.status(201).json(word);
  } catch (error) {
    console.error('Error creating word:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:listId/words', authMiddleware, async (req, res) => {
  const { listId } = req.params;

  console.log(`Fetching words for listId: ${listId}`);

  try {
    const words = await Word.findAll({ where: { w_list_id: listId } });
    if (!words || words.length === 0) {
      console.log(`No words found for listId: ${listId}`);
      return res.status(404).json({ message: 'No words found for this list' });
    }
    res.status(200).json({ words });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:listId/icons', authMiddleware, async (req, res) => {
  const { listId } = req.params;
  const { keyword } = req.body; // listId sollte vom Frontend gesendet werden

  if (!keyword || !listId) {
      return res.status(400).send('keyword and listId are required');
  }
  console.log('Empfangenes keyword und listId:', keyword, listId);

  let iconName;
  let iconSvg;
  
  try {
        const iconData = await getIconDatafromAPI(keyword);

        if (iconData && iconData.iconName && iconData.iconSvg) {
            iconName = iconData.iconName;
            iconSvg = iconData.iconSvg;
            console.log('Icon Name:', iconName);
            console.log('Icon SVG:', iconSvg);
        } else {
            console.log('No icon data was returned.');
            return res.status(404).send('Icon data not found');
        }

      const newIcon = await Icon.create({ i_list_id: listId, icon_name: iconName, icon_svg: iconSvg });

      // Erfolgreiche Antwort mit dem erstellten Icon zurückgeben
      res.status(201).json(newIcon);
  } catch (error) {
      console.error('Fehler beim Verarbeiten des Icons:', error);
      res.status(500).send('Interner iconRoute-1 Serverfehler');
  }
});

router.get('/:listId/icons', authMiddleware, async (req, res) => {
  const { listId } = req.params;

  console.log(`Fetching icons for listId: ${listId}`);

  try {
    const icons = await Icon.findAll({ where: { i_list_id: listId } });
    if (!icons || icons.length === 0) {
      console.log(`No icons found for listId: ${listId}`);
      return res.status(404).json({ message: 'No icons found for this list' });
    }
    res.status(200).json({ icons });
  } catch (error) {
    console.error('Error fetching icons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




export default router;
