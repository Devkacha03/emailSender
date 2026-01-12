import xlsx from "xlsx";
import fs from "fs";
import csvParser from "csv-parser";
import { getAllEmails, getEmailsWithNames } from "./emailValidator.js";

// ✅ Helper: Extract emails from file
export const extractEmailsFromFile = async (mailFile) => {
  try {
    if (
      //* extract email from the xlsx (excel) file
      mailFile.mimetype.includes("spreadsheetml") ||
      mailFile.originalname.endsWith(".xlsx")
    ) {
      const workbook = xlsx.readFile(mailFile.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      return getAllEmails(data);
    } else if (
      //* extract email from the csv file
      mailFile.mimetype === "text/csv" ||
      mailFile.originalname.endsWith(".csv")
    ) {
      const results = [];
      const stream = fs.createReadStream(mailFile.path).pipe(csvParser());

      for await (const row of stream) {
        results.push(row);
      }

      return getAllEmails(results);
    } else {
      throw new Error("Unsupported file format");
    }
  } catch (error) {
    throw new Error(`Failed to parse email file: ${error.message}`);
  }
};

// ✅ NEW: Extract emails WITH names from file for personalization
export const extractEmailsWithNamesFromFile = async (mailFile) => {
  try {
    if (
      //* extract email from the xlsx (excel) file
      mailFile.mimetype.includes("spreadsheetml") ||
      mailFile.originalname.endsWith(".xlsx")
    ) {
      const workbook = xlsx.readFile(mailFile.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      return getEmailsWithNames(data);
    } else if (
      //* extract email from the csv file
      mailFile.mimetype === "text/csv" ||
      mailFile.originalname.endsWith(".csv")
    ) {
      const results = [];
      const stream = fs.createReadStream(mailFile.path).pipe(csvParser());

      for await (const row of stream) {
        results.push(row);
      }

      return getEmailsWithNames(results);
    } else {
      throw new Error("Unsupported file format");
    }
  } catch (error) {
    throw new Error(`Failed to parse email file: ${error.message}`);
  }
};
