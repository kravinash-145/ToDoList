
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date = require(__dirname + "/date.js");
const day = date.getDate();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-avinash:test123@cluster0.iwigd.mongodb.net/todolistDB",{useNewUrlParser : true});

const itemSchema= new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item",itemSchema);
const item1= new Item({
  name: "Welcome to todolist!"
});

const item2 = new Item({
  name: "Click on + button to add new item"
});

const item3 = new Item({
  name:"Click the checkbox to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name: String,
  items:[itemSchema]
});

const List= mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find(function(err,items){
    if(items.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
      
        }
        else{
          console.log("successful");
        }
      });
      res.redirect("/");
      
    }
    else{
      
      res.render("list", {listTitle: day,newListItems : items});
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const Newitem= new Item({
    name: itemName
  });
  if(listName=== day){
    
    Newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(Newitem);
      foundList.save();
      res.redirect("/" + listName);
    });

  }
  
});

app.post("/delete",function(req,res){
  const checkedId =req.body.checkbox;
  const listName=req.body.listName;
  if(listName=== day){
    Item.findByIdAndRemove(checkedId,function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},
                {$pull:{items:{_id:checkedId}}},function(err,foundList){
                  if(!err){
                    res.redirect("/" +listName);

                  }
                });
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName },function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle:foundList.name ,newListItems :foundList.items});
        
      }
    }
  });
  
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
