const request = indexedDB.open('budgetDb', 1);
let db, tx, store;

request.onupgradeneeded = (event) => {
  db = event.target.result;

  store = db.createObjectStore('budgetAction', {autoIncrement: true});
}

request.onsuccess = (event) => {
  console.log(`Success: ${event.target.result}`)
  db = request.result;
  tx = db.transaction('budgetAction', 'readwrite');
  store = tx.objectStore("budgetAction")
}

request.onerror = (event) => {
  console.log(`error`)
}

const loadDbReconnect = () => {

  const allBudgetActions = store.getAll();

  allBudgetActions.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(allBudgetActions.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {

            store.clear();
            console.log('Cleared store');
          }
        });
    }
  };
}

const addToStore = (info) => {
  if(window.onoffline){
  store.add(info);
  }
}
