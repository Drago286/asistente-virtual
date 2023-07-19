
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
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

    console.log(response.data.choices[0].text);
};
  module.exports = { generateResponse };