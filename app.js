//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // step 1 require mongoose
// l-370(revisiting Lodash) https://lodash.com/docs/4.17.15#capitalize
// l-370 step 1 install npm i lodash in hyper and step 2 require in app
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// step2  connect monoose // info from https://mongoosejs.com/
// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://admin-michaeloha:Toomuch_1@cluster0.e4dyr.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });

// step 3 create schema
const itemsSchema = {
  name: "String"
};

//step 4 create Monogoose Model( the ModelName = Item)
const Item = mongoose.model("Item", itemsSchema);

//step 5 create new mongoose document

const item1 = new Item({
  name: "Welcome to your new todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3= new Item({
  name: "<-- Hit this to delete an item."
});

// step 6
const defaultItems = [item1, item2, item3];
// // step 7 Monogoose insertMany() https://mongoosejs.com/docs/api/model.html#model_Model.insertMany
// Item.insertMany(defaultItems, function(err,){
//   if (err){
//       console.log(err);
//   } else {
//     console.log("Succesfully saved default items to DB");
//   }
//
// });

// L-368 step 2
const listSchema ={
  name: String,
  items:[itemsSchema]
}
// L-368 step 3 (List Mongoose.Model)
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  // Tues 30/6/20 L-365 Rendering database item into todolistDB
  // https://mongoosejs.com/docs/api/model.html#model_Model.find
// find (MyModel.find({ name: 'john', age: { $gte: 18 }}, function (err, docs) {});)
 // Step A to find all. READ !!!
Item.find({},function(err, foundItems){
  // step // B
  if (foundItems === 0){
    Item.insertMany(defaultItems, function(err,){
      if (err){
          console.log(err);
      } else {
        console.log("Succesfully saved default items to DB");
      }

    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});

});
//  L-368 Creating custom list using Express Route Parameters
// step1 -368
app.get("/:customListName", function(req,res){
  // l-370(revisiting Lodash) https://lodash.com/docs/4.17.15#capitalize(_.capitalize([string='']))
  const customListName = _.capitalize(req.params.customListName);
  // step 5 -368
  List.findOne({name: customListName}, function (err, foundList) {
    if(!err){
      if(!foundList){
        // console.log("doesn't exist");
        //create a new list l-368

        const list = new List ({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // step6 list-368
        // show an existing list
        // console.log("exists");
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  });

  // // l-368 step 4 now pasted into step 5 l-368
  // const list = new List ({
  //   name: customListName,
  //   items:defaultItems
  // });
  // list.save();
});


//  NOTES
// L-368 Creating custom list using Express Route Parameters
// 1. create a get route (above)
// 2. create a new schema called listSchema (above)
// 3.create the List Mongoose.Model (above)
// 4. create the new List []
// 5.find one Adventure.findOne({ type: 'iphone' }, function (err, adventure) {});https://mongoosejs.com/docs/api/model.html#model_Model.findOne

// L-366 Adding new items to our todolist database (Updating)
 // L-366 step c also list.ejs was rectified
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  // L-369 Adding New items to the custom Todolist
// step1 of L-369
// added value="<%=listTitle %> in button to list.ejs
// step2 l-369 - create a listName
const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  // step 3 l-369
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


//Tues 1/7/20 367 - deleting item from our Todolist Database
// deleting L-367 step 1 also list.ejs was rectified (form was added)
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  // L-370(Revisitng Lodash and deleting item from custon Todolist)
  // step 1.-l-370 (cut step 1 l-367 into it)
  const listName = req.body.listName;
  if(listName ==="Today"){
    // step1 -l-367
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
    }
    });
  } else {
    // https://docs.mongodb.com/manual/reference/operator/update/pull/
    // { $pull: { <field1>: <value|condition>, <field2>: <value|condition>, ... } }
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});





app.get("/about", function(req, res){
  res.render("about");
});
// From Heroku step 4 Listen on the correct PORT
// https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port, function() {
  console.log("Server has started Succesfully");
});
