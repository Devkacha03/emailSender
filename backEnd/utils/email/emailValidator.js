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

// ✅ NEW: Get emails with names for personalization
export const getEmailsWithNames = (emailList) => {
  const emailData = emailList.map((row) => {
    // Check all possible email column names (case-insensitive)
    const email = (
      row.email || row.Email || row.EMAIL || 
      row["Email ID"] || row["email id"] || row["EMAIL ID"] ||
      row.EmailID || row.emailid || row.EMAILID ||
      row["E-mail"] || row["e-mail"] || row["E-MAIL"] ||
      ""
    ).toString().trim().toLowerCase();
    
    // Check all possible name column names (case-insensitive)
    const name = (
      row.name || row.Name || row.NAME ||
      row.FullName || row.fullname || row.FULLNAME ||
      row["Full Name"] || row["full name"] || row["FULL NAME"] ||
      row.FirstName || row.firstname || row.FIRSTNAME ||
      row["First Name"] || row["first name"] || row["FIRST NAME"] ||
      row.Username || row.username || row.USERNAME ||
      row.Recipient || row.recipient || row.RECIPIENT ||
      ""
    ).toString().trim();
    
    return {
      email,
      name: name || null // null if no name provided
    };
  }).filter(item => item.email && validator.isEmail(item.email));

  // Remove duplicates based on email
  const uniqueEmails = new Map();
  emailData.forEach(item => {
    if (!uniqueEmails.has(item.email)) {
      uniqueEmails.set(item.email, item);
    }
  });

  return Array.from(uniqueEmails.values());
};

// ✅ NEW: Parse email and name from text format (email,name or just email)
export const parseEmailsFromText = (text) => {
  const lines = text.split(/[\n,]/).map(line => line.trim()).filter(line => line);
  
  const emailData = lines.map(line => {
    // Check if line contains comma (email,name format)
    if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      const email = parts[0].toLowerCase();
      const name = parts[1] || null;
      
      return {
        email,
        name
      };
    } else {
      // Just email
      return {
        email: line.toLowerCase(),
        name: null
      };
    }
  }).filter(item => item.email && validator.isEmail(item.email));

  // Remove duplicates based on email
  const uniqueEmails = new Map();
  emailData.forEach(item => {
    if (!uniqueEmails.has(item.email)) {
      uniqueEmails.set(item.email, item);
    }
  });

  return Array.from(uniqueEmails.values());
};

// ✅ NEW: Personalize message with recipient name
export const personalizeMessage = (message, name) => {
  if (!message) return message;
  
  // Replace {{name}} with actual name or fallback
  const personalizedName = name || "Valued Customer";
  let personalizedMsg = message.replace(/\{\{name\}\}/gi, personalizedName);
  
  // Convert line breaks to HTML <br> tags for proper email formatting
  personalizedMsg = personalizedMsg.replace(/\n/g, '<br>');
  
  return personalizedMsg;
};
