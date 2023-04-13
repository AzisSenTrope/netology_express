```js
db.books.insertMany([
  {
    title: "title1",
    description: "description1",
    authors: "authors1",
  },
  {
    title: "title2", 
    description: "description2",
    authors: "authors2",
  },
]);

db.books.find({ title: "<value>" });

db.books.updateOne(
  { _id: "ObjectId(bookId)" },
  {
    $set: {
      description: "description new",
      authors: "authors new",
    },
  }
);
```