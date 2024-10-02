class ToDoListManager {
    constructor() {
      this.init();
    }
  
    async init() {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
  
      if (!token || !userId) { // Kombinierte Prüfung für Authentifizierung
        return console.error('User not authenticated.'); // Verkürzte Fehlerbehandlung
      }
  
      console.log('User authenticated with token and userId:', token, userId);
  
      try {
        await this.fetchUserLists();
        this.setupEventListeners();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    }
// ----------------------------------------------------------------------------

    getItemTypeAndId(eventTarget) {
      const wordId = eventTarget.dataset.wordId;
      const iconId = eventTarget.dataset.iconId;
      const medId = eventTarget.dataset.medId;

      // Prüfe nur auf Formularelemente, wenn es sich tatsächlich um ein Formular handelt
      if (eventTarget.matches('form')) {
        const wordType = eventTarget.querySelector('.word-type') ? eventTarget.querySelector('.word-type').value : null;

        if (wordType === 'word') {
          return { type: 'words', itemId: null }; // Kein itemId, da es sich um einen neuen Eintrag handelt
        } else if (wordType === 'icon') {
          return { type: 'icons', itemId: null }; // Kein itemId, da es sich um einen neuen Eintrag handelt
        } else if (wordType === 'med') {
          return { type: 'meds', itemId: null }; // Kein itemId, da es sich um einen neuen Eintrag handelt
        } else {
          return { type: null, itemId: null }; // Fehlerbehandlung
        }
      }

      // Wenn es kein Formular ist, gehen wir von einem vorhandenen Item aus (Checkboxes, Buttons etc.)
      if (wordId) {
        return { type: 'words', itemId: wordId };
      } else if (iconId) {
        return { type: 'icons', itemId: iconId };
      } else if (medId) {
        return { type: 'meds', itemId: medId };
      } else {
        return { type: null, itemId: null }; // Fehlerbehandlung, wenn nichts passt
      }
    }

// ----------------------------------------------------------------------------
    async fetchUserLists() {
      try {
        const response = await fetch('http://localhost:3000/list', {
          method: 'GET',
          headers: this.getHeaders(),
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
  
        const lists = await response.json();
  
        // Hier holen wir die Daten für alle Listen ab
        for (const list of lists.lists) {
          const [icons, words, meds] = await Promise.all([
            this.fetchItemsForList(list.list_id, 'icons'),
            this.fetchItemsForList(list.list_id, 'words'),
            this.fetchItemsForList(list.list_id, 'meds'),
          ]);
  
          list.icons = icons;
          list.words = words;
          list.meds = meds;
        }
  
        console.log('User lists and items fetched successfully');
        this.renderUserLists(lists.lists);
      } catch (error) {
        console.error('Error fetching user lists or items:', error);
      }
    }
// ----------------------------------------------------------------------------
    getHeaders() {
      return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
    }
// ----------------------------------------------------------------------------
async fetchItemsForList(listId, type) {
  try {
    const response = await fetch(`http://localhost:3000/list/${listId}/${type}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} fetched successfully for list ${listId}`);
    
    // Prüfe, ob die Daten ein Array sind
    if (Array.isArray(data[type])) {
      return data[type];
    } else {
      console.error(`Expected an array for ${type}, but got`, data[type]);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${type} for list:`, error);
    return []; // Rückgabe eines leeren Arrays im Fehlerfall
  }
}

// ----------------------------------------------------------------------------  
renderItemsForList(listId, items_icons, items_words, items_meds) {
  const listElement = document.querySelector(`div[data-list-id='${listId}']`);
  const itemListElement = listElement.querySelector('.word-list');
  itemListElement.innerHTML = '';

  // Render words
  items_words.forEach(({ word_name, word_id, completed }) => {
    const isChecked = completed ? 'checked' : '';
    itemListElement.innerHTML += `
      <li class="todo-list-item">
        <input type="checkbox" class="todo-list-item input" ${isChecked} data-word-id="${word_id}">
        <span>${word_name}</span>
        <button type="submit" class="delete-button" data-word-id="${word_id}">Delete</button>
      </li>
    `;
  });

  // Render icons
  items_icons.forEach(({ icon_svg, icon_id, completed }) => {
    const isChecked = completed ? 'checked' : '';
    itemListElement.innerHTML += `
      <li class="todo-list-item">
        <input type="checkbox" class="todo-list-item input" ${isChecked} data-icon-id="${icon_id}">
        <span>${icon_svg}</span>
        <button type="submit" class="delete-button" data-icon-id="${icon_id}">Delete</button>
      </li>
    `;
  });

  // Render meds and interactions
  items_meds.forEach(({ med_name, med_id, completed, interactions }) => {
    const isChecked = completed ? 'checked' : '';
    
    // Check for interactions
    let interactionDetailsHTML = '';
    if (interactions && interactions.length > 0) {
      interactionDetailsHTML = '<ul class="interaction-list">';
      interactions.forEach(interaction => {
        interactionDetailsHTML += `<li>Interaction with ${interaction.existingMedId}: ${interaction.interactionDetail}</li>`;
      });
      interactionDetailsHTML += '</ul>';
    }

    itemListElement.innerHTML += `
      <li class="todo-list-item">
        <input type="checkbox" class="todo-list-item input" ${isChecked} data-med-id="${med_id}">
        <span>${med_name}</span>
        <button type="submit" class="delete-button" data-med-id="${med_id}">Delete</button>
        ${interactionDetailsHTML}  <!-- Insert interaction details if any -->
      </li>
    `;
  });
}


// ----------------------------------------------------------------------------  
  renderUserLists(lists) {
    console.log('Rendering user lists.');
    const listContainer = document.getElementById('listContainer');
    listContainer.innerHTML = '';
  
    lists.forEach(list => {
      console.log('Rendering list:', list.list_name);
      const listElement = document.createElement('div');
      listElement.classList.add('user-list');
      listElement.dataset.listId = list.list_id; // setz die ID aus der Datenbank auf class="user-list" im HTML 
      listElement.innerHTML = `
        <div class="list-header">
          <h3>${list.list_name}</h3>
          <button type="submit" class="delete-list-button">Delete</button>
        </div>
        <ul class="word-list"></ul>
        <form id="addWordForm-${list.list_id}" class="add-word-form">
          <input type="text" id="keyword-${list.list_id}" class="word-input" placeholder="Add new word...">
          <select class="word-type">
            <option value="word">Word</option>
            <option value="icon">Icon</option>
            <option value="med">Med</option>
          </select>
          <button type="submit" class="add-word-button">Add</button>
        </form>
      `;
      listContainer.appendChild(listElement);
  
      // Aufruf von renderItemsForList für Icons und Wörter
      this.renderItemsForList(list.list_id, list.icons, list.words, list.meds);
    });
  }
// ----------------------------------------------------------------------------
async addItemToList(listId, keyword, type) {
  try {
    const response = await fetch(`http://localhost:3000/list/${listId}/${type}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ keyword }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const newItem = await response.json();  // Hier kommt die Antwort vom Backend, inklusive "interactions" oder "message"
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully:`, newItem);

    // Wenn Wechselwirkungen vorhanden sind, zeige diese an
    if (newItem.interactions && newItem.interactions.length > 0) {
      const interactionDetails = newItem.interactions.map(interaction => {
        return `Interaction between new medication and ${interaction.existingMedId}: ${interaction.interactionDetail}`;
      }).join('\n');
      
      alert(`Drug Interactions Found:\n${interactionDetails}`);  // Zeige die Wechselwirkungen als Alert oder im UI an
    } else if (newItem.message) {
      console.log(newItem.message);  // "No interactions found"
    }

    await this.fetchUserLists();  // Aktualisiere die Liste nach dem Hinzufügen
  } catch (error) {
    console.error(`Error adding ${type} to list:`, error);
  }
}


// ----------------------------------------------------------------------------
    setupEventListeners(){ 
      console.log('Setting up event listeners');

      document.getElementById('createListForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const listName = event.target.listName.value.trim();
        if (listName) await this.createList(listName);
      });
  
      document.getElementById('listContainer').addEventListener('submit', async (event) => {
        if (event.target.matches('.add-word-form')) {
          event.preventDefault();
          const listId = event.target.id.split('-')[1];
          const keyword = event.target.querySelector('.word-input').value.trim();
      
          // Verwende getItemTypeAndId, um den Typ zu bestimmen
          const { type } = this.getItemTypeAndId(event.target); 
      
          if (keyword && type) {
            await this.addItemToList(listId, keyword, type);
          } else {
            console.error('Invalid type or empty keyword');
          }
        }
      });      

      document.getElementById('listContainer').addEventListener('change', (event) => {
        if (event.target.matches('.todo-list-item input')) {
          const listId = event.target.closest('.user-list').dataset.listId;
          const { type, itemId } = this.getItemTypeAndId(event.target); // Typ und ID bestimmen
          const isChecked = event.target.checked; // Checkbox-Status
      
          if (!itemId) {
            console.error('Item ID not found');
            return;
          }
      
          // Aktualisiere den Status des Items (Word, Icon oder Med)
          this.updateItemStatus(listId, type, itemId, isChecked);
        }
      });

      document.getElementById('listContainer').addEventListener('click', (event) => {
        if (event.target.matches('.delete-button')) {
          const listId = event.target.closest('.user-list').dataset.listId;
          const { type, itemId } = this.getItemTypeAndId(event.target); // Typ und ID bestimmen
      
          if (!itemId) {
            console.error('Item ID not found');
            return;
          }
      
          // Lösche das Item (Word, Icon oder Med)
          this.deleteItem(listId, type, itemId);
        }
      });
         
    
    }
// ----------------------------------------------------------------------------
    


// ----------------------------------------------------------------------------
async updateItemStatus(listId, type, itemId, isChecked) {
  try {
    let endpoint;
    
    if (type === 'icons') {
      endpoint = `http://localhost:3000/list/${listId}/icons/${itemId}`;
    } else if (type === 'words') {
      endpoint = `http://localhost:3000/list/${listId}/words/${itemId}`;
    } else if (type === 'meds') {  // Füge hier die Logik für "meds" hinzu
      endpoint = `http://localhost:3000/list/${listId}/meds/${itemId}`;
    } else {
      throw new Error('Invalid type');
    }

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ completed: isChecked }), // Completed-Status senden
    });

    if (!response.ok) throw new Error('Network response was not ok');

    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} completion status updated successfully`);
  } catch (error) {
    console.error(`Error updating ${type} completion status:`, error);
  }
}

// ----------------------------------------------------------------------------
async deleteItem(listId, type, itemId) {
  try {
    let endpoint;

    if (type === 'icons') {
      endpoint = `http://localhost:3000/list/${listId}/icons/${itemId}`;
    } else if (type === 'words') {
      endpoint = `http://localhost:3000/list/${listId}/words/${itemId}`;
    } else if (type === 'meds') {  // Füge hier die Logik für "meds" hinzu
      endpoint = `http://localhost:3000/list/${listId}/meds/${itemId}`;
    } else {
      throw new Error('Invalid type');
    }

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);

    // Aktualisiere die Liste nach dem Löschen
    await this.fetchUserLists();
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
  }
}


// ----------------------------------------------------------------------------
async deleteList(listId) {
  try {
    const response = await fetch(`http://localhost:3000/list/${listId}`, {
      method: 'DELETE',
      headers: this.getHeaders(), // Hier wird der Token für die Authentifizierung mitgeschickt
    });

    if (!response.ok) throw new Error('Network response was not ok');

    console.log(`List with ID ${listId} deleted successfully`);

    // Aktualisiere die Liste nach dem Löschen
    await this.fetchUserLists();
  } catch (error) {
    console.error('Error deleting list:', error);
  }
}

// ----------------------------------------------------------------------------
    async createList(listName) {
      try {
        const response = await fetch('http://localhost:3000/list', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ listName }),
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
  
        await this.fetchUserLists();
      } catch (error) {
        console.error('Error creating list:', error);
      }
    }
// ----------------------------------------------------------------------------
  }
// ----------------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    new ToDoListManager();
  });
  