import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!client) {
    if (!apiKey) throw new Error("Missing GOOGLE_GEMINI_API_KEY");
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export type EmailGenParams = {
  event: {
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    location: string;
    venue?: string;
    description?: string;
  };
  audienceName?: string;
  tone?: "friendly" | "professional" | "excited";
  customPrompt?: string;
};

export async function generateEmailContent({ event, audienceName, tone = "friendly", customPrompt }: EmailGenParams) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const basePrompt = `Write a concise reminder email about an upcoming event.
- Title: ${event.title}
- Date: ${event.date}
- Time: ${event.time}
- Location: ${event.location}${event.venue ? `, ${event.venue}` : ""}
- Audience: ${audienceName ?? "Attendee"}
- Tone: ${tone}
- Include: brief agenda highlight, what to bring (if applicable), and a clear CTA to view details or manage booking.
Return JSON with keys: subject, html, text.`;

  const fullPrompt = customPrompt ? `${basePrompt}\nExtra instructions: ${customPrompt}` : basePrompt;

  const result = await model.generateContent(fullPrompt);
  const text = result.response.text();

  // Attempt to parse JSON block from LLM output
  const match = text.match(/\{[\s\S]*\}/);
  let subject = `Reminder: ${event.title}`;
  let html = `<p>Hi ${audienceName ?? "there"},</p><p>This is a reminder for <strong>${event.title}</strong> on <strong>${event.date}</strong> at <strong>${event.time}</strong> in ${event.location}${event.venue ? `, ${event.venue}` : ""}.</p><p>See details and manage your booking on our site.</p>`;
  let plain = `Reminder: ${event.title} on ${event.date} at ${event.time} in ${event.location}${event.venue ? `, ${event.venue}` : ""}.`;

  if (match) {
    try {
      const json = JSON.parse(match[0]);
      subject = json.subject ?? subject;
      html = json.html ?? html;
      plain = json.text ?? plain;
    } catch {}
  }

  return { subject, html, text: plain };
}
