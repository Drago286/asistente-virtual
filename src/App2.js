import { Configuration, OpenAIApi } from 'openai';
import React, { useState } from 'react';
import './chat.css';
import FormSection from './FormSection';
import AnswerSection from './AnswerSection';

const App2 = () => {
  const configuration = new Configuration({
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);

  const [storedValues, setStoredValues] = useState([]);

  const generateResponse = async (newQuestion, setNewQuestion) => {
    let options = {
      model: 'text-davinci-003',
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['/'],
    };

    let completeOptions = {
      ...options,
      prompt: newQuestion,
    };

    const response = await openai.createCompletion(completeOptions);

    if (response.data.choices) {
      setStoredValues([
        {
          question: newQuestion,
          answer: response.data.choices[0].text,
        },
        ...storedValues,
      ]);
      setNewQuestion('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">ChatGPT</h1>
      <div className="chat-content">
        <FormSection generateResponse={generateResponse} />
        <AnswerSection storedValues={storedValues} />
      </div>
    </div>
  );
};

export default App2;