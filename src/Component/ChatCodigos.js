import React, { useState, useRef, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";

import "./ChatCodigos.css";

function ChatCodigos() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [replyApi, setReplyApi] = useState([]);

  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase = "En contexto a una tabla llamada Codigos con las siguientes columnas Codigo,Descripcion_del_Evento,Limitaciones_del_Evento,Deteccion_de_la_Informacion,Guia_para_la_Deteccion_de_Fallas,Equipo, genera una query segun la consulta de mi usuario, pero en tu respuesta solo quiero la query, evita agregar tus idicaciones:";

  const API_KEY = "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"; // Replace with your valid API key

  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const sendQueryToAPI = async (query) => {
    console.log(query);
    try {
      const response = await fetch("http://172.20.10.2:8000/api/execute-query-codigos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplyApi(data);
        console.log(data);
        console.log(replyApi);

        if (data.length > 0) {
          

          data.forEach(function (objeto) {
            var Detección_de_la_lnformacion = objeto.Deteccion_de_la_Informacion || "";
            var Guia_para_la_Detección_de_Fallas = objeto.Guia_para_la_Deteccion_de_Fallas ||  "";
            
           
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Deteccion: ${Detección_de_la_lnformacion}\n `, sender: "bot" },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Guia: ${Guia_para_la_Detección_de_Fallas}\n `, sender: "bot" },
            ]);
           
          });
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { content: "No se encontraron registros. Intente reformular su consulta, de otro modo recargue la página.", sender: "bot" },
          ]);
        }
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: "Error de conexión con el servidor, intentelo más tarde o comun´quese con el administrador", sender: "bot" },
      ]);
    }
  };

  const handleSendMessage = async (newQuestion) => {
    if (newQuestion.trim() === "") {
      // Si el campo está vacío o solo contiene espacios en blanco, no hacer nada
      return;
    }
    try {
      const updatedMessages = [
        ...messages,
        { content: newQuestion, sender: "user" },
        { content: "Consultando a la base de datos...", sender: "bot" },
      ];

      setMessages(updatedMessages);

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
        prompt:
          mensajeBase +
          newQuestion +
          " Solo dame la query seleccionando Deteccion_de_la_Informacion, Guia_para_la_Deteccion_de_Fallas. interpreta CAEX como Equipo (Solo toma el numero que puede ser 830, 930E4 y 930E3).",
      };

      const response = await openai.createCompletion(completeOptions);

      if (response.data.choices) {
        setQuery(response.data.choices[0].text);
      }

      setNewMessage("");
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: toString(error), sender: "bot" },
      ]);
    }
  };

  useEffect(() => {
    if (query !== "") {
      sendQueryToAPI(query);
    }
  }, [query]);

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
    const microphoneButton = document.querySelector(
      ".button-container button:last-child"
    );
    if (microphoneButton) {
      microphoneButton.classList.toggle("recording");
    }
  };

  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.lang = "es-ES";
      recognition.current.continuous = true;

      recognition.current.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        setNewMessage(transcript); // Show the text in the console
      };

      recognition.current.onend = () => {
        if (isRecording.current) {
          recognition.current.start();
        }
      };

      recognition.current.start();
      isRecording.current = true;
    } else {
      console.error("Speech recognition is not supported in this browser.");
    }
  };

  const stopRecognition = () => {
    if (recognition.current) {
      recognition.current.stop();
      isRecording.current = false;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
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
        <div>
          <div className="chat-header">
            <div className="chat-title">Asistente virtual</div>
            <button onClick={handleResetConversation}>
              Eliminar conversacion
            </button>
          </div>
          <h3 className="instruction">Guia para consultar:
          "Codigo n° del CAEX (830 - 930E2 - 930E4)"</h3>
          
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
            aria-multiline
            value={newMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
          />
          <div className="button-container">
            <button onClick={() => handleSendMessage(newMessage)}>
              Enviar
            </button>
            <button onClick={handleVoiceRecognition}>
              {isRecording.current ? (
                <FontAwesomeIcon icon={faStopCircle} /> // Usa faStopCircle en lugar de faTimesCircle
              ) : (
                <FontAwesomeIcon icon={faMicrophone} /> // Usa faMicrophone en lugar de faMicrophoneAlt
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatCodigos;
