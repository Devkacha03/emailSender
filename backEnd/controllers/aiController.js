import axios from "axios";
import dotenv from "dotenv";
import { globalErrorHandler } from "./errorsManager.js";

dotenv.config();

export const generateEmailContent = async (req, res) => {
  try {
    const { subject, emailType = "single" } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required to generate email content",
      });
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Grok API key is not configured. Please add GROK_API_KEY to your environment variables.",
      });
    }

    // Create a detailed prompt based on email type
    let prompt = "";
    if (emailType === "bulk") {
      prompt = `You are an AI email generator.

Input:
- One email subject
- A list of recipient names

Task:
Generate a separate email template for EACH recipient using the SAME subject.
Personalize the greeting with the recipient's name using {{name}} placeholder.
Keep the email professional, polite, and clear.
Do not explain anything.

Subject:
${subject}

Requirements:
- Start with "Dear {{name}}," to personalize for each recipient
- Write in a professional yet friendly tone
- Use proper line breaks and spacing between paragraphs (add empty lines between sections)
- Format bullet points with proper spacing (each on a new line)
- Structure the email with proper greeting, body, and closing sections
- Make it suitable for mass mailing (newsletters, announcements, etc.)
- Keep it concise and engaging
- Add a clear call-to-action if relevant
- End with professional regards on a new line

FORMATTING EXAMPLE:
Dear {{name}},

[Opening paragraph]

[Main content with details]

[Bullet points if needed - each on new line with spacing]

[Closing paragraph]

[Call to action if applicable]

Best regards,
[Signature]

Output:
Generate ONE well-formatted email template with proper line breaks and spacing.
Generate only the email body content, no subject line.`;
    } else {
      prompt = `Generate a professional email content for the following subject: "${subject}"

Requirements:
- Write in a professional and courteous tone
- Start with an appropriate greeting
- Structure the email with clear paragraphs
- Make the content relevant to the subject
- Include necessary details and context
- Keep it clear and concise
- End with professional closing
- Use [Your Name] as a placeholder for the sender's name

Generate only the email body content, no subject line.`;
    }

    // Detect API type based on key format
    let apiUrl, requestBody;
    
    if (apiKey.startsWith('gsk_')) {
      // Groq API (using latest llama model)
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      requestBody = {
        messages: [
          {
            role: "system",
            content: "You are a professional email content generator. Create well-structured, professional emails based on the given subject and requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      };
    } else {
      // xAI Grok API
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      requestBody = {
        messages: [
          {
            role: "system",
            content: "You are a professional email content generator. Create well-structured, professional emails based on the given subject and requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0.7
      };
    }

    // Call API
    const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const generatedText = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      content: generatedText,
      message: "Email content generated successfully",
    });
  } catch (error) {
    console.error("Error generating email content:", error.response?.data || error.message);
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid Groq API key. Please check your configuration.",
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "API rate limit exceeded. Please try again later.",
      });
    }

    if (error.response?.data?.error?.code === 'model_decommissioned') {
      return res.status(400).json({
        success: false,
        message: "The AI model is no longer available. Please contact support.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message || "Failed to generate email content",
    });
  }
};
