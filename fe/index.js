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
          const [icons, words] = await Promise.all([
            this.fetchItemsForList(list.list_id, 'icons'),
            this.fetchItemsForList(list.list_id, 'words')
          ]);
  
          list.icons = icons;
          list.words = words;
        }
  
        console.log('User lists and items fetched successfully');
        this.renderUserLists(lists.lists);
      } catch (error) {
        console.error('Error fetching user lists or items:', error);
      }
    }
  
    getHeaders() {
      return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
    }
  
    async fetchItemsForList(listId, type) {
      try {
        const response = await fetch(`http://localhost:3000/list/${listId}/${type}`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
  
        const data = await response.json();
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} fetched successfully for list ${listId}`);
        
        return data[type]; // Rückgabe der Daten anstelle des direkten Renderns
      } catch (error) {
        console.error(`Error fetching ${type} for list:`, error);
        return []; // Rückgabe eines leeren Arrays im Fehlerfall
      }
    }
  
    renderItemsForList(listId, items_icons, items_words) {
      const listElement = document.querySelector(`div[data-list-id='${listId}']`);
      const itemListElement = listElement.querySelector('.word-list');
      itemListElement.innerHTML = '';
  
      items_words.forEach(({ word_name }) => {  // Nutzung von Destrukturierung
        itemListElement.innerHTML += `<li>${word_name}</li>`; // Nutzung von Template-Literal für HTML-String
      });
  
      items_icons.forEach(({ icon_svg }) => {  // Nutzung von Destrukturierung
        itemListElement.innerHTML += `<li>${icon_svg}</li>`;
      });
  }
  
  
  renderUserLists(lists) {
    console.log('Rendering user lists.');
    const listContainer = document.getElementById('listContainer');
    listContainer.innerHTML = '';
  
    lists.forEach(list => {
      console.log('Rendering list:', list.list_name);
      const listElement = document.createElement('div');
      listElement.classList.add('user-list');
      listElement.dataset.listId = list.list_id;
      listElement.innerHTML = `
        <div class="list-header">
          <h3>${list.list_name}</h3>
          <button class="delete-list-button">X</button>
        </div>
        <ul class="word-list"></ul>
        <form id="addWordForm-${list.list_id}" class="add-word-form">
          <input type="text" id="keyword-${list.list_id}" class="word-input" placeholder="Add new word...">
          <select class="word-type">
            <option value="word">Word</option>
            <option value="icon">Icon</option>
          </select>
          <button type="submit" class="add-word-button">Add</button>
        </form>
      `;
      listContainer.appendChild(listElement);
  
      // Aufruf von renderItemsForList für Icons und Wörter
      this.renderItemsForList(list.list_id, list.icons, list.words,);
    });
  }
  
  
    async addItemToList(listId, keyword, type) {
      try {
        const response = await fetch(`http://localhost:3000/list/${listId}/${type}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ keyword }),
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
  
        const newItem = await response.json();
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully:`, newItem);
        await this.fetchUserLists();
      } catch (error) {
        console.error(`Error adding ${type} to list:`, error);
      }
    }
  
    setupEventListeners() {
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
          const type = event.target.querySelector('.word-type').value === 'word' ? 'words' : 'icons';
          
          if (keyword) await this.addItemToList(listId, keyword, type);
        }
      });
    }
  
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
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    new ToDoListManager();
  });
  