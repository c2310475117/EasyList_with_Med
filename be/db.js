import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';

// Konvertiert die URL der aktuellen Datei in Dateipfad.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Verbindet den Verzeichnispfad (__dirname) mit weiteren Verzeichnisebenen + Dateinamen (EasyListDB.sqlite)
const databaseFilePath = path.join(__dirname, 'Database', 'EasyListDB.sqlite');
console.log('Database file path:', databaseFilePath);

// Verbindung zur Datenbank herstellen
const Sequ = new Sequelize({
  dialect: 'sqlite',
  storage: databaseFilePath // Speicherort der SQLite-Datenbankdatei
});

// Synchronisiere alle Modelle
const syncDatabase = async () => {
  try {
    await Sequ.query('PRAGMA busy_timeout = 30000');
    await Sequ.authenticate();
    console.log('Connection to the database has been established successfully.');
    await Sequ.sync({ force: false }); // setze force auf false um die Daten nicht zu verlieren
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { Sequ, syncDatabase };
export default Sequ;
