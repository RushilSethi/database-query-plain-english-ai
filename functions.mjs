import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_AI_TOKEN;
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o-mini";
const client = new ModelClient(endpoint, new AzureKeyCredential(token));

export async function generateSQL(question) {
    const prompt = `Convert this question to a PostgreSQL SQL query: "${question}".
        Use standard SQL syntax and assume a relational database schema.`;
  
        const response = await client.path("/chat/completions").post({
            body: {
              messages: [
                { role: "system", content: "You are an expert SQL generator"},
                { role: "user", content: question }
              ],
              model: modelName,
              temperature: 1.0,
              max_tokens: 1000,
              top_p: 1.0
            }
          });
  
    return response.choices[0].message.content.trim();
  }

export async function generateTextResponse(question, queryResult) {
    const prompt = `Given the question: "${question}" and the result: ${JSON.stringify(
      queryResult
    )}, 
      provide a clear and concise plain English response.`;
  
      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: "You are an AI assistant that converts database results to plain English."},
            { role: "user", content: prompt }
          ],
          model: modelName,
          temperature: 1.0,
          max_tokens: 1000,
          top_p: 1.0
        }
      });
  
    return response.choices[0].message.content.trim();
  }



  