const { GoogleGenerativeAI } = require("@google/generative-ai");

// The final key provided by the user
const apiKey = "AIzaSyCXQF4R9fQyLj5bTxbLKsEtXpes8b_nOzI";

async function testFinalKey() {
  console.log("Testing FINAL API Key...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello, is the API properly enabled now?");
    const response = await result.response;
    console.log("SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("STILL FAILED!");
    console.error("Error Message:", error.message);
  }
}

testFinalKey();
