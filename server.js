const express = require("express");
const axios = require("axios");
const supabase = require("./supabaseConfig");
const OpenAI = require("openai");
require('dotenv').config();

const app = express();
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("its working on port 7000");
});

// endpoint that converts the plain english to sql and returns the response in english
app.post("/query", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const aiFunctions = await import('./functions.mjs');
    const sqlQuery = await aiFunctions.generateSQL(question);
    const queryResult = await runSupabaseQuery(sqlQuery);
    const answer = await aiFunctions.generateTextResponse(question, queryResult);
    res.json({ answer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// functions using the openai package

// const token = process.env.GITHUB_AI_TOKEN;
// const endpoint = "https://models.inference.ai.azure.com";
// const modelName = "gpt-4o-mini";
// const client = new OpenAI({ baseURL: endpoint, apiKey: token });

// async function generateSQL(question) {
//   const prompt = `Convert this question to a PostgreSQL SQL query: "${question}".
//       Use standard SQL syntax and assume a relational database schema.`;

//   const response = await client.chat.completions.create({
//     messages: [
//       { role: "system", content: "You are an expert SQL generator." },
//       { role: "user", content: prompt },
//     ],
//     temperature: 0.7,
//     max_tokens: 150,
//     model: modelName,
//   });

//   return response.choices[0].message.content.trim();
// }

async function runSupabaseQuery(query) {
  const { data, error } = await supabase.rpc("run_custom_sql", {
    query_text: query,
  });

  if (error) {
    throw new Error(`Error running query: ${error.message}`);
  }

  return data;
}

// async function generateTextResponse(question, queryResult) {
//   const prompt = `Given the question: "${question}" and the result: ${JSON.stringify(
//     queryResult
//   )}, 
//     provide a clear and concise plain English response.`;

//   const response = await client.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are an AI assistant that converts database results to plain English.",
//       },
//       { role: "user", content: prompt },
//     ],
//     temperature: 0.7,
//     max_tokens: 100,
//     model: modelName,
//   });

//   return response.choices[0].message.content.trim();
// }

app.listen(7000, () => {
  console.log("server is running on port 7000");
});
