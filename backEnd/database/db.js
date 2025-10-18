import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); //? config dotenv file

const databaseConnection = async () => {
  try {
    //? check databaseconnection string & password is true or false
    if (!process.env.DATABASEURL || !process.env.DATABASEPASSWORD) {
      console.error(
        `Error: Missing critical environment variables. Check our .env file. error File {dataBase.js}`
      );
      process.exit(1); //? condition is true then process is exit
    }
    const { DATABASEURL, DATABASEPASSWORD } = process.env; //? Destructuring process.env file and get db string with password

    const dbUrl = DATABASEURL;
    const ecommerceDBUrl = dbUrl.replace("<db_password>", DATABASEPASSWORD); //? replace password to true password

    await mongoose.connect(ecommerceDBUrl); //! connect mongodb

    console.log("DataBase is connected successfully");
  } catch (error) {
    console.error(error.message);
    console.error("dataBase Connection Error");
    process.exit(1);
  }
};

export default databaseConnection;
