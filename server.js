import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import booksData from "./data/books.json";
import listEndpoints from "express-list-endpoints";

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
//
// import goldenGlobesData from './data/golden-globes.json'
// import avocadoSalesData from './data/avocado-sales.json'
// import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: "Services unavailable" });
  }
});

const Book = mongoose.model("Book", {
  bookID: Number,
  title: String,
  authors: String,
  average_rating: Number,
  isbn: Number,
  isbn13: Number,
  language_code: String,
  num_pages: Number,
  ratings_count: Number,
  text_reviews_count: Number,
});

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Book.deleteMany();

    booksData.forEach((item) => {
      new Book(item).save();
    });
  };
  seedDatabase();
}

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

app.get("/books", async (req, res) => {
  const { title, authors } = req.query;

  try {
    const allBooks = await Book.find({
      title: new RegExp(title, "i"),
      authors: new RegExp(authors, "i"),
    });
    res.json(allBooks);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
  }
});

app.get("/books/id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleBook = await Book.findById(id);

    if (!singleBook) {
      res.status(404).json({
        error: "No book found",
      });
    } else {
      res.json({
        response: singleBook,
        success: true,
      });
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

app.get("/books/pages/shortbooks", async (req, res) => {
  try {
    const shortBooks = await Book.find({ num_pages: { $lt: 351 } }).sort({
      num_pages: "asc",
    });
    res.json(shortBooks);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
    console.log("error");
  }
});

app.get("/books/pages/mediumbooks", async (req, res) => {
  try {
    const mediumBooks = await Book.find({
      $and: [{ num_pages: { $gt: 350 } }, { num_pages: { $lt: 800 } }],
    }).sort({
      num_pages: "asc",
    });
    res.json(mediumBooks);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
    console.log("error");
  }
});

app.get("/books/pages/longbooks", async (req, res) => {
  try {
    const longBooks = await Book.find({ num_pages: { $gt: 799 } }).sort({
      num_pages: "desc",
    });
    res.json(longBooks);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
    console.log("error");
  }
});

app.get("/books/ratings/lowratings", async (req, res) => {
  try {
    const lowRating = await Book.find({ average_rating: { $lt: 2.5 } });
    res.json(lowRating);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
  }
});

app.get("/books/ratings/mediumratings", async (req, res) => {
  try {
    const mediumRating = await Book.find({
      $and: [
        { average_rating: { $gte: 2.5 } },
        { average_rating: { $lt: 3.7 } },
      ],
    });
    res.json(mediumRating);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
  }
});

app.get("/books/ratings/highratings", async (req, res) => {
  try {
    const highRating = await Book.find({ average_rating: { $gte: 3.8 } });
    res.json(highRating);
  } catch (error) {
    res.status(400).json({
      error: "Cannot find any books",
    });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
