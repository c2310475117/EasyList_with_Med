//!-- backend/routes/controllerRoutes.js -->

import User from '../models/userModel.js';
import List from '../models/listModel.js';
import Word from '../models/wordModel.js';
import Icon from '../models/iconModel.js';


// Beispiel: Definieren der Controller-Routen
const controllerRoutes = () => {
  try {
  // Eine User kann viele Listen haben
  console.log('Initializing controller routes...');
  User.hasMany(List, { foreignKey: 'l_user_id' });
  List.belongsTo(User, { foreignKey: 'l_user_id' });

  List.hasMany(Word, { foreignKey: 'w_list_id' });
  Word.belongsTo(List, { foreignKey: 'w_list_id' });

  List.hasMany(Icon, { foreignKey: 'i_list_id' });
  Icon.belongsTo(List, { foreignKey: 'i_list_id' });
  
} catch (error) {
  console.error('Error setting up model relationships:', error);
  throw error; // Optional: Wirft den Fehler erneut, um das Programm zu stoppen oder die Ausnahme in der aufrufenden Funktion zu behandeln
}
};

export { controllerRoutes };
