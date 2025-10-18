import fs from "fs";

// ✅ Helper: Clean up uploaded files
export const cleanupFiles = async (files) => {
  if (!files || files.length === 0) return;

  const deletePromises = files.map((file) =>
    fs.promises
      .unlink(file.path)
      .catch((err) => console.error(`Failed to delete ${file.path}:`, err))
  );

  await Promise.allSettled(deletePromises);
  console.log(`Cleaned up ${files.length} uploaded files`);
};
