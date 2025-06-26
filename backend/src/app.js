require("dotenv").config();
const express = require("express");
const cors = require("cors");
const recipesRouter = require("../routes/recipes.js"); // FIXED ✅
const indexRouter = require("../routes/index.js");
const usersRouter = require("../routes/users.js");
const authRouter = require("../routes/auth.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/recipes", recipesRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
