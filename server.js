require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;


app.use(express.static('public'));
app.use(express.json());

app.post('/api/fetch', async (req, res) => {
    try {
        const tools = [
            {
              "type": "function",
              "function": {
                "name": "get_places_in_city",
                "description": "Get the places to visit in city",
                "parameters": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "Name of the place",
                    },
                    "description": {
                        "type": "string", 
                        "description": "description of the place",
                    },
                    "type":{
                        "type": "string", 
                        "description": "type of the place",
                    }
                  },
                  "required": ["name","description","type" ],
                  additionalProperties: false
                },
              }
            }
        ];
        //const func = {"role": "function", "name": "get_places_in_city", "content": "{\"name\": \"\", \"description\": \"\", \"type\": \"\"}"};
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o",
            messages: [{ role: "system", content: "You are a helpful assistant. return results in json format" }, { role: "user", content: req.body.prompt }],
            tools: tools
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.error('Error in response of OpenAI API:', response.data.choices[0].message? JSON.stringify(response.data.choices[0].message, null, 2) : error.message);
        const toolCalls = response.data.choices[0].message.tool_calls;
        let messageContent = '';
        if(toolCalls){
            toolCalls.forEach((functionCall)=>{
                messageContent += functionCall.function.arguments+",";
            });
        }
        res.json({ message: messageContent });

    } catch (error) {
        res.status(500).json({ error: 'Failure to get response from OpenAI', details: error.message });
    }
});

app.listen(PORT, () => {});