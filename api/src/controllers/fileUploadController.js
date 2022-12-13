const upload = require("../middleware/upload");
const dbConfig = require("../config/db");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url; 

const baseUrl = "http://localhost:8080/files/";

const mongoClient = new MongoClient(url);

const uploadFiles = async (req, res) => {
  try {
    await upload(req, res);
    if (req.file == undefined)  {
      return res.status(400).send({ message: "Choose file to be upload " });
    }
    return res.status(200).send({
      message: "Upload Sucess " + req.file.originalname,
    });
  } catch (error) {
    console.log(error);
     if (error.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File can't be over 2MB ",
      });
    }
    return res.status(500).send({
      message: `Can't upload file:, ${error}`
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database); 
    const files = database.collection(dbConfig.filesBucket + ".files");
    let fileInfos = [];

    if ((await files.estimatedDocumentCount()) === 0) {
        fileInfos = []
    }

    let cursor = files.find({})
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.filesBucket,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);
    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Can't get file " });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  uploadFiles,
  getListFiles,
  download,
};

