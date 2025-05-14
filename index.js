const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1/ChatBoard");
}

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

app.listen("8080", () => {
  console.log("server is listening at port 8080");
});

app.get("/", (req, res) => {
  res.render("root.ejs");
});

app.get("/chats", async (req, res, next) => {
  try {
    let chats = await Chat.find();
    res.render("index.ejs", { chats });
  } catch (err) {
    next(err);
  }
});

app.get("/chats/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/chats", async (req, res, next) => {
  try {
    let { from, message, to } = req.body;
    let newChat = new Chat({
      from: from,
      message: message,
      to: to,
      created_at: new Date(),
    });

    await newChat.save();
    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

app.get("/chats/:id/edit", async (req, res, next) => {
  try {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
  } catch (err) {
    next(err);
  }
});

app.put("/chats/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let { message: newMessage } = req.body;

    let updateChat = await Chat.findByIdAndUpdate(
      id,
      { message: newMessage },
      { runValidators: true }
    );

    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

app.delete("/chats/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let deleteChat = await Chat.findByIdAndDelete(id);
    console.log(deleteChat);
    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

//error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Occured" } = err;
  res.status(status).send(message);
});
