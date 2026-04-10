const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function testGemini20() {
  console.log("Testing Gemini 2.0 Flash...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent("Hello, are you Gemini 2.0?");
    const response = await result.response;
    console.log("SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("FAILED!");
    console.error("Error Message:", error.message);
  }
}

testGemini20();
