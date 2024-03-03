import express from 'express';

const app = express();
const port = 3333;

app.get('/', (req, res) => {
  res.send('Hello Worlds!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
