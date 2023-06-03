const axios = require('axios');

const apiKey = process.env.SUMMARIZER_API_KEY;

const calculateMaxTokens = (inputText) => {
  const inputTokens = inputText.split(' ').length;
  const estimatedSummaryTokens = Math.ceil(inputTokens * 0.2);
  return Math.min(estimatedSummaryTokens, 6000);
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Received request to /summarize');
  const { text } = req.body;
  console.log('Text to summarize:', text);
  const maxTokens = calculateMaxTokens(text);

  try {
    console.log('Sending request to GPT-3 API...');
    const gpt3Response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: text,
          },
          {
            role: "system",
            content: "Please provide a 5-7 sentence summary of the above text that captures the main idea and conclusion in first person.",
          },
        ],
        max_tokens: maxTokens,
        temperature: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log('Received response from GPT-3 API');

    if (gpt3Response.data.choices && gpt3Response.data.choices.length > 0) {
      const summary = gpt3Response.data.choices[0].message.content.trim();
      console.log('GPT-3 API response:', gpt3Response.data);
      console.log('Generated summary:', summary);
      res.status(200).json({ summary });
    } else {
      console.log('No choices found in GPT-3 API response:', gpt3Response.data);
      res.status(500).json({ error: 'No summary generated' });
    }
  } catch (error) {
    console.error('Error calling GPT-3 API:', error);
    res.status(500).json({ error: `Error calling GPT-3 API: ${error.message}` });
  }
};
