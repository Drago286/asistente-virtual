import React, { useState, useRef, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
//import odbc from 'odbc';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recordedMessage, setRecordedMessage] = useState("");
  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase = "En contexto a una tabla llamada Fallas con las siguientes columnas Equipo,Fecha Inicio,Hora Inicio,Fecha Final,Hora Final,Duracion,Duracion Excel,Codigo,Categoria	Descripcion,Comentario	Caidas,Tipo Mant.,Código,Sistema,Sub Sistem.,Componentes,Equipo	Sistema,Componente,Horas,Mes,Motor,Flota, genera una query segun la consulta de mi usuario: ";

  const API_KEY = "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"; // Reemplaza con tu clave de API válida

  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    if (recordedMessage !== "") {
      handleSendMessage(recordedMessage);
      setRecordedMessage("");
    }
  }, [recordedMessage]);

  /*
  const connectToDatabase = async () => {
    try {
      const connection = await odbc.connect('DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=https://codelcochile.sharepoint.com/:u:/r/teams/MantencionCaex/Shared%20Documents/Archivos%20de%20prueba/Fallas.accdb?csf=1&web=1&e=JMgYrS');
      return connection;
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      return null;
    }
  };
  */
  
  const handleSendMessage = async (newQuestion) => {
    const updatedMessages = [
      ...messages,
      { content: newQuestion, sender: "user" },
      { content: "", sender: "bot" },
    ];

    setMessages(updatedMessages);

    /*


    const connection = await connectToDatabase();
  if (connection) {
    // Realizar una consulta de prueba a la base de datos
    const query = 'SELECT * FROM TableName LIMIT 5'; // Reemplaza "TableName" por el nombre de la tabla que deseas consultar
    const result = await connection.query(query);

    // Mostrar algunas filas de resultados en la consola
    console.log('Filas de la base de datos:', result.fetchAllSync());
  }
  */

    let options = {
      model: "text-davinci-003",
      temperature: 0,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["/"],
    };

    let completeOptions = {
      ...options,
      prompt: mensajeBase + newQuestion,
    };

    const response = await openai.createCompletion(completeOptions);

    if (response.data.choices) {
      updatedMessages[updatedMessages.length - 1].content =
        response.data.choices[0].text;
      setMessages(updatedMessages);
    }

    setNewMessage("");
  };

  const handleResetConversation = () => {
    setMessages([]);
    setNewMessage("");
  };

  const handleVoiceRecognition = () => {
    if (isRecording.current) {
      stopRecognition();
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
        setNewMessage(transcript); // Mostrar el texto en la consola

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
            {isRecording.current ? 'Detener grabación' : 'Grabar y Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
