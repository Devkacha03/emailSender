import validator from "validator";

export const emailIsValidAndRemoveDuplicate = (email) => {
  // ✅ Validate and deduplicate emails
  const validEmails = email
    .filter((e) => e && typeof e === "string")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => validator.isEmail(e));

  return [...new Set(validEmails)];
};

export const getAllEmails = (emailList) => {
  let emailListData = [];
  emailListData = emailList.map(
    (row) => row.email || row.Email || row["Email ID"] || row.EMAIL
  );
  return emailIsValidAndRemoveDuplicate(emailListData);
};
