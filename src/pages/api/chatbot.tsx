import express, { Request, Response } from 'express';
const app = express();

// This is a simple function that returns a random response
function getResponse(): string {
const responses = [
"Hello!",
"How are you doing?",
"What can I help you with?",
"I'm sorry, I didn't understand that.",
"Tell me more...",
"That's interesting!",
"Thanks for chatting with me!",
];
return responses[Math.floor(Math.random() * responses.length)];
}

// This route handles incoming POST requests to the chatbot API
app.post('/api/chatbot', (req: Request, res: Response) => {
// Get the user's message from the request body
const userMessage = req.body.text;

// Call your GPT-3 API here to get a response
// Replace this with your actual API call
const chatbotResponse = getResponse();

// Send the response back to the client
res.json({ response: chatbotResponse });
});

// Export the Express app as the default module export
export default app;
