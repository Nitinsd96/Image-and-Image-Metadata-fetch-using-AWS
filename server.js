#! /usr/bin/env node

// require("dotenv").config({ silent: true });

const path = require("path");
const express = require("express");
const publicPath = path.join(__dirname, "public");
const app = express();
const bodyParser=require("body-parser")
const EXIF = require("./exif.js");
// app.use(bodyParser.raw());
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(publicPath));

var ExifImage = require("exif").ExifImage;

app.post("/getAttributes", (req, res) => {

  console.log(req.body)
  EXIF.getData(
    {
      src: req.body.url,
    },
    function () {
      console.log(EXIF.getAllTags(this));
      res.send(EXIF.getAllTags(this));
    }
  );
});
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

//Run application
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server running on port: %d", port);
});
