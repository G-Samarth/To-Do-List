//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-samarth:test123@cluster0-kfzc5.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// const itemsSchema = new mongoose.Schema({
//   name: String
// });
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to your ToDoList!"});
const item2 = new Item({name: "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- Hit this to delete an item"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}


const List = mongoose.model("List", listSchema);
app.get("/", function(req, res) {
//const day = date.getDate();
  Item.find(function(err, items){
    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log(err);
        else
          console.log("Success");
      });
      res.redirect("/");
    }

    res.render("list", {listTitle: "Today", newListItems: items});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(id, function(err){
      if(!err)
        console.log("Successfully Deleted");
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:topic", function(req,res){
  const listName = _.capitalize(req.params.topic);

  List.findOne({name: listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
