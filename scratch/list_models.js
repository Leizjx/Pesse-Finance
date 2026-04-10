const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function listModels() {
  console.log("Listing available models for this key...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the JS SDK's GoogleGenerativeAI class usually
    // It's usually part of the admin client or we have to use fetch.
    // However, we can just try name variants.
    
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`Model ${modelName}: SUCCESS`);
      } catch (e) {
        console.log(`Model ${modelName}: FAILED - ${e.message}`);
      }
    }
  } catch (error) {
    console.error("Critical error:", error.message);
  }
}

listModels();
