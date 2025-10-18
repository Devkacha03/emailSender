import { createTransporter } from "../mailTransporter.js";
import { cleanupFiles } from "../file/fileCleanup.js";

// ✅ Helper: Send emails in batches with rate limiting
export const sendEmailsInBatches = async (
  config,
  emailList,
  subject,
  message,
  attachments
) => {
  try {
    const transport = createTransporter(config);
    const BATCH_SIZE = 10; // Send 10 emails at a time
    const DELAY_MS = 10000; // 1 second delay between batches

    let successful = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < emailList.length; i += BATCH_SIZE) {
      const batch = emailList.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map((email) =>
          transport.sendMail({
            from: config.email,
            to: email,
            subject,
            html: message,
            attachments,
          })
        )
      );

      // ✅ Track results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successful++;
        } else {
          failed++;
          errors.push({
            email: batch[index],
            error: result.reason?.message || "Unknown error",
          });
        }
      });
      // ✅ Rate limiting: delay between batches
      if (i + BATCH_SIZE < emailList.length)
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
    return { successful, failed, errors };
  } catch (error) {
    throw new Error(`Failed to parse email file: ${error.message}`);
  }
};

export const sendEmailsSequentially = async (
  config,
  emailList,
  subject,
  message,
  attachments,
  uploadedFiles
) => {
  try {
    const transport = createTransporter(config);
    const DELAY_MS = 30000; // 30 seconds

    let successful = 0;
    let failed = 0;
    const errors = [];

    console.log(
      `Starting to send ${emailList.length} emails with 30-second intervals...`
    );

    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];

      try {
        await transport.sendMail({
          from: config.email,
          to: email,
          subject,
          html: message,
          attachments,
        });

        successful++;
        console.log(`✓ Email ${i + 1}/${emailList.length} sent to ${email}`);
      } catch (error) {
        failed++;
        errors.push({
          email,
          error: error.message,
        });
        console.error(
          `✗ Email ${i + 1}/${emailList.length} failed for ${email}:`,
          error.message
        );
      }

      // ✅ Wait 30 seconds before sending next email (except for the last one)
      if (i < emailList.length - 1) {
        console.log(`Waiting 30 seconds before next email...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    // ✅ Clean up uploaded files
    await cleanupFiles(uploadedFiles);

    console.log(
      `\n📊 Bulk email completed: ${successful} successful, ${failed} failed`
    );

    return { successful, failed, errors };
  } catch (error) {
    throw new Error(`Failed to parse email file: ${error.message}`);
  }
};
