const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Lost and Found Tracker is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/api/items', (req, res) => {
  res.json([{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }]);
});
