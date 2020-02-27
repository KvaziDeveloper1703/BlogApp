const   express             = require("express"),
        methodOverride      = require("method-override"),
        bodyParser          = require("body-parser"),
        expressSanitizer    = require("express-sanitizer"),
        mongoose            = require("mongoose"),
        app                 = express();
        

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

mongoose.connect("mongodb+srv://Viktor:Mikkeli@cluster0-8spbw.mongodb.net/Blog?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
        
mongoose.connection.on("connected", () =>{
    console.log("Mongoose is connected!");
});
        
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: String,
        default: Date.now()
    }
});
        
const Blog = mongoose.model("Blog", BlogSchema);

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (error, blogs) => {
        if (error) {
            console.log(error);
        } else {
            res.render("index", {blogposts: blogs});
        }
    });
});

app.get("/blogs/new", (req, res)=>{
    res.render("new");
});

app.post("/blogs", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (error, newBlog) => {
        if (error){
            res.render("new");
        } else {
            res.redirect("/blogs")
        }
    });
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) =>{
        if (error){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) => {
        if (error){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog:foundBlog});
        }
    });
});

app.put("/blogs/:id", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (error, updatedBlog) => {
        if (error) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete("/blogs/:id", (req, res) => {
    Blog.findOneAndRemove(req.params.id, (error)=>{
        if (error){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs")
        }
    });
});

app.listen(3000, () => {
    console.log("App is listening to port 3000!");
});