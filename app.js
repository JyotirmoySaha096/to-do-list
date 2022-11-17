const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const date = require(__dirname + "/date.js")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use('*/css',express.static('public/css'));


//connecting mongoose and mongodb
mongoose.connect('mongodb://localhost:27017/todolistDB');

//making a schema for items
const itemSchema = new mongoose.Schema({
  name : String
});

const Item = new mongoose.model("Item", itemSchema);

//default items            
  const Item1 = new Item({
      name: "Buy Food"
  });
  
  const Item2 = new Item({
    name: "Cook Food"
  });

  const Item3 = new Item({
  name: "Eat Food"
  });

var defaultItems = [Item1,Item2,Item3];           //var items=["Buy Food", "Cook Food", "Eat Food"];
var newItem="";
var nowDay = new Date();
var useDay = nowDay.toLocaleDateString('en-US', {weekday:"long"});
// console.log(useDay);
// var routeName="";

app.get("/", function (req, res) {
  //console.log(date());
  currentDay=date();

  Item.find({},function(err,its){
    if(its.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          //console.log("Success");
        }
      })
      res.redirect("/");
    }else if(err){
      console.log(err);
    }else{
        res.render("list", { listTitle: currentDay, newItems: its });
    }
  })
});

app.post("/delete", function(req,res){
  //console.log(req.body.checkbox);
  delItemId = req.body.checkbox;
  delInCustomList = req.body.lsName;
  //console.log(delItem);
  if(delInCustomList === useDay + ","){
    Item.findByIdAndRemove(delItemId,function(err){
      if(err){
        console.log(err);
      }else{
        //console.log("Success");
      }
      res.redirect("/");
  })
  }else{
    //deleting by using the mongo pull request.
    CustomListModel.findOneAndUpdate({name: delInCustomList},{$pull: {items:{_id:delItemId}}},function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/" + delInCustomList);
      }
    })
  }
  
});

//making of custom Lists using express route parameters:-
//Making a schema for every list as they are also going to be saved in our server.
//Each list will have a name which will be their title and it will be taken from user and a set of items which
//will be give by the user and that will be going to save along with the list.
const customListSchema = new mongoose.Schema({
  name: String,                   
  items: [itemSchema]
});

//creating a model for the custom lists using the above schema.
const CustomListModel = mongoose.model("List", customListSchema);

//creating a route to get the request. Here, it will create a new list and store it into the database.
app.get("/:customListName", function (req, res) {
   const customListName = _.capitalize(req.params.customListName);
   
   CustomListModel.findOne({name: customListName},function(err,foundList){
    if(err){
      console.log(err);
    }else{
      if(foundList){
        //console.log("Your list already exists.");
        res.render("list",{ listTitle: foundList.name, newItems: foundList.items });
      }else if(!foundList){
        //create new list.
          customDelfaultItem = new Item({
            name: "Add " + customListName + " items below "
          });
          const newList = new CustomListModel({
            name: customListName,
            items:[customDelfaultItem]
          });
          newList.save();
          res.redirect("/" + customListName);
      }
    } 
   })

   
    //res.send(routeName);
});

/*app.get("/about", function (req, res) {
    var routeName="work";
      //res.send("Yes");
    res.render("about");
  });*/

app.post("/",function(req,res){
  //newItem = req.body.input;

   newItem = new Item({
    name: req.body.input
  });
    if(req.body.btn === useDay + ","){
      newItem.save();
        // Item.insertMany(newItem,function(err){
        //   if(err){
        //     console.log(err);
        //   }else{
        //     console.log("Success");
        //   }
        // })
      res.redirect('/');
    }else{
      CustomListModel.findOne({name: req.body.btn},function(err,foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + req.body.btn)
      })
    }
  //console.log(items);
})

app.listen(process.env.PORT || 3000, function () {
  //console.log("Express is running at port 3000");
});
