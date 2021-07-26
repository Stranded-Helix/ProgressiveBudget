let db;
let budgetVersion;

const request = indexedDB.open('BudgetDB', 4);

request.onupgradeneeded = function (event) {

  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetAction', {
       autoIncrement: true 
      });
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function updateDatabase() {
  let transaction = db.transaction(['BudgetAction'], 'readwrite');
  const store = transaction.objectStore('BudgetAction');
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(['BudgetAction'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetAction');
            currentStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    updateDatabase();
  }
};

const saveRecord = (action) => {
  const transaction = db.transaction(['BudgetAction'], 'readwrite');
  const store = transaction.objectStore('BudgetAction');
  store.add(action);
};

window.addEventListener('online', updateDatabase);