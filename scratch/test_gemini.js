const { GoogleGenerativeAI } = require("@google/generative-ai");

// The key provided by the user
const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function testKey() {
  console.log("Testing API Key...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Test with stable model first
    
    const result = await model.generateContent("Hello, are you alive?");
    const response = await result.response;
    const text = response.text();
    console.log("Response Success:", text);
    
    const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result2 = await model2.generateContent("Test 2.0");
    const response2 = await result2.response;
    console.log("Response 2.0 Success:", response2.text());
    
  } catch (error) {
    console.error("Test Failed!");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Status:", error.status);
    }
  }
}

testKey();
