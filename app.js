var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	expressSanitizer = require("express-sanitizer"),
	methodOverride = require("method-override"),
	bodyParser = require("body-parser");

// APP CONFIG
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.connect("mongodb://localhost:27017/blog_app", {useNewUrlParser : true});

// CREATE A SCHEMA FOR BLOG DB
var blogSchema = new mongoose.Schema({
	Title: String,
	Image: String,
	Body: String,
	Created: {type: Date, default: Date.now}
});

// CREATE A MODEL FOR BLOG DB
var Blog = mongoose.model("Blog", blogSchema);

// ROUTE ROUTING
app.get("/", function(req, res){
	res.redirect("/blogs");
})

// INDEX ROUTING
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});


// CREATE ROUTE
app.post("/blogs", function(req, res){
	Blog.create(req.body.blog, function(err){
		req.body.blog.Body = req.sanitize(req.body.blog.Body);
		if(err){
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			// console.log(req.params.id)
			res.render("show", {blog : foundBlog});
		}
	});
});


// EDIT ROUTE
// This route is like combination between show and post route
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE (PUT ROUTE)
app.put("/blogs/:id", function(req, res) {
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
		req.body.blog.Body = req.sanitize(req.body.blog.Body);
		if(err) {
			res.redirect("/blogs");
		} else {
			console.log(updateBlog);
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndDelete(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});


// LISTEN TO APP
app.listen(3000, function(){
	console.log("BLOG APP HAS STARTED");
});