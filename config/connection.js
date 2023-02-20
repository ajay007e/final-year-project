//mongoDB connection setups

const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = function (done) {
  const url = "mongodb://localhost:27017";
  const dbName = "project";

  mongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, data) => {
      if (err) return done(err);
      state.db = data.db(dbName);
      done();
    }
  );
};

module.exports.get = function () {
  return state.db;
};
