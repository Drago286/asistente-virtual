import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recordedMessage, setRecordedMessage] = useState('');
  const recognition = useRef(null);
  const isRecording = useRef(false);

  const API_KEY = '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'; // Reemplaza con tu clave de API válida

  useEffect(() => {
    // No se necesita configurar la clave de API de OpenAI aquí
  }, []);

  const handleSendMessage = async (message) => {
    setMessages([...messages, { content: message, sender: 'user' }]);
    setNewMessage('');

    try {
      const response = await fetchOpenAIModel(message);
      setMessages([...messages, { content: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error al enviar mensaje a OpenAI:', error);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setNewMessage('');
  };

  const fetchOpenAIModel = async (message) => {
    const url = 'https://api.openai.com/v1/engines/davinci/completions';

    try {
      const response = await axios.post(
        url,
        {
          prompt: message,
          max_tokens: 50
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
          }
        }
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      throw new Error('Error al enviar solicitud a la API de OpenAI');
    }
  };

  const handleVoiceRecognition = () => {
    if (isRecording.current) {
      stopRecognition();
      setShowConfirmation(true);
    } else {
      startRecognition();
    }
  };

  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.lang = 'es-ES';
      recognition.current.continuous = true;

      recognition.current.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        setRecordedMessage(transcript);
        setShowConfirmation(true);
      };

      recognition.current.onend = () => {
        if (isRecording.current) {
          recognition.current.start();
        }
      };

      recognition.current.start();
      isRecording.current = true;
    } else {
      console.error('El reconocimiento de voz no es compatible con este navegador.');
    }
  };

  const stopRecognition = () => {
    if (recognition.current) {
      recognition.current.stop();
      isRecording.current = false;
    }
  };

  const handleConfirmMessage = () => {
    setShowConfirmation(false);
    handleSendMessage(recordedMessage);
  };

  const handleDiscardMessage = () => {
    setShowConfirmation(false);
    setRecordedMessage('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage(newMessage);
    }
  };

  const handleChange = (event) => {
    setNewMessage(event.target.value);
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-avatar"></div>
          <div className="chat-title">CAEX</div>
          <button onClick={handleResetConversation}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.content}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
          />
          <button onClick={() => handleSendMessage(newMessage)}>Enviar</button>
          <button onClick={handleVoiceRecognition}>
            {isRecording.current ? 'Detener Grabación' : 'Grabar y Enviar'}
          </button>
        </div>
        {showConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <p>¿Deseas enviar el siguiente mensaje?</p>
              <p>{recordedMessage}</p>
              <div className="modal-buttons">
                <button onClick={handleConfirmMessage}>Enviar</button>
                <button onClick={handleDiscardMessage}>Descartar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
