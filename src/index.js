const express = require("express");
const connectDB = require("./utils/db");
const app = express();
const routes = require("./routes/index");
require("dotenv").config();

app.use(express.json());

app.use("/api", routes);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
