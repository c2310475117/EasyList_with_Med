import User from './models/userModel.js';
import jwt from 'jsonwebtoken';
import List from './models/listModel.js';

const secretKey = process.env.JWT_SECRET || 'geheimnis'; // Verwenden Sie eine Umgebungsvariable für den geheimen Schlüssel

const generateAccessToken = (userId) => {
  console.log('Generating access token for user ID:', userId);
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, secretKey);
};

// Middleware zur Überprüfung des Tokens
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {
    const decoded = verifyToken(token);
    console.log('Token decoded successfully:', decoded);

    req.user = decoded; // Speichern der Nutzerdaten im Request-Objekt
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(403).json({ message: 'Unauthorized access' });
  }
}

const checkListAccess = async (req, res, next) => {
  try {
    const listId = req.params.listId; // Listennamen aus den Request-Parametern extrahieren
    const userId = req.user.userId; // ID des authentifizierten Benutzers aus req.user

    console.log("UserID:", userId);
    console.log("ListID:", listId);

    // Überprüfen, ob der Benutzer Zugriff auf die Liste hat
    const list = await List.findOne({ where: { list_id: listId, l_user_id: userId } }); // Annahme: List-Modell mit findOne

    if (!list) {
      return res.status(403).json({ message: 'Keine Berechtigung für die angeforderte Aktion.' });
    }

    console.log('Access granted: List found for user ID:', userId);
    req.list = list; // Füge die Liste dem Request hinzu
    next();
  } catch (error) {
    console.error('Autorisierungsfehler:', error);
    return res.status(500).json({ message: 'Interner Serverfehler.' });
  }
};

export { authMiddleware, generateAccessToken, checkListAccess, verifyToken };
