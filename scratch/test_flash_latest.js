const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function testFlashLatest() {
  console.log("Testing gemini-flash-latest...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const result = await model.generateContent("Hello, are you operational?");
    const response = await result.response;
    console.log("SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("FAILED!");
    console.error("Error Message:", error.message);
  }
}

testFlashLatest();
