const apiKey = "AIzaSyD3o0WHzN9rAGjabT4gYAg1F6B2eVBLS-E";

async function listFlashModels() {
  console.log("Checking Flash models...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Flash Models found:");
      data.models?.filter(m => m.name.includes("flash")).forEach(m => {
        console.log(`- ${m.name}`);
      });
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

listFlashModels();
