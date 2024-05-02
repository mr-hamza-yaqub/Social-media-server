const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
module.exports = async () => {
  const mongoUri =
    "mongodb+srv://hamza:0qUQLje3D1w0HExv@cluster0.ykykt2i.mongodb.net/?retryWrites=true&w=majority";

  try {
    const connect = await mongoose.connect(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
