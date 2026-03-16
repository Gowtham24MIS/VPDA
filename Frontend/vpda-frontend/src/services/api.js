export const sendText = async (text) => {
    const res = await fetch("https://localhost:5001/api/intent/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  
    return await res.text();
  };
  