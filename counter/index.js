const express = require("express");
const db = require("./db/counter");

const app = express();

app.use(express.json());

app.get("/counter/:id", (req, res) => {
  res.status(200).json(db.get(req.params.id));
});

app.post("/counter/:id/incr", (req, res) => {
  res.status(200).json(db.incr(req.params.id));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Запущен счетчик http://localhost:${PORT}`);
});
