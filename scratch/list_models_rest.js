const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function listAllModels() {
  console.log("Attempting to list models...");
  try {
    // We'll use the REST API directly since listing models is sometimes restricted in the high-level SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Available Models:");
      data.models?.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

listAllModels();
