// write an express server that servers .html file as view on port 3000

const express = require("express");
const path = require("path");
const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// Path: server/index.html