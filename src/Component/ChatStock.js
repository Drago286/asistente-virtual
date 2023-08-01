import React, { useState, useRef, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStopCircle } from "@fortawesome/free-solid-svg-icons";

import "./ChatStock.css";

function ChatStock() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [replyApi, setReplyApi] = useState([]);

  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase =
    "En contexto a una tabla llamada componentes con las siguientes columnas (id,Equipo,Nombre,Sistema,UM,Stock,En_linea), genera una query segun la consulta de mi usuario, pero en tu respuesta solo quiero la query, evita agregar tus idicaciones:";

  const API_KEY = "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"; // Replace with your valid API key

  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const getAllStock = async () => {

    console.log(query);
    try {
      const response = await fetch(
        "http://172.20.10.2:8000/api/execute-query-stock-general",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplyApi(data);
        console.log(data);
        console.log(replyApi);

        if (data.length > 0) {
          data.forEach(function (objeto) {
            var Nombre = objeto.Nombre || "";
            var Equipo = objeto.Equipo || "";
            var UM = objeto.UM || "";
            var Stock = objeto.Stock || "";
            var En_linea = objeto.En_linea || "";

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content:
                  "----------------------------------",
                sender: "bot",
              },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Nombre: ${Nombre}\n `,
                sender: "bot",
              },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Equipo: ${Equipo}\n `,
                sender: "bot",
              },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- ${UM}: ${Stock}\n `,
                sender: "bot",
              },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- En línea: ${En_linea}\n `,
                sender: "bot",
              },
            ]);
          });
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content:
                "No se encontraron registros en la base de datos. Reformule su pregunta o recargue la página.",
              sender: "bot",
            },
          ]);
        }
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content:
            "Error de conexión con el servidor, intentelo más tarde o comuníquese con el administrador",
          sender: "bot",
        },
      ]);
    }
  };



  const sendQueryToAPI = async (query) => {
    console.log(query);
    try {
      const response = await fetch(
        "http://172.20.10.2:8000/api/execute-query-stock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplyApi(data);
        console.log(data);
        console.log(replyApi);

        if (data.length > 0) {
          data.forEach(function (objeto) {
            var Nombre = objeto.Nombre || "";
            var Equipo = objeto.Equipo || "";
            var UM = objeto.UM || "";
            var Stock = objeto.Stock || "";
            var En_linea = objeto.En_linea || "";

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content:
                  "----------------------------------",
                sender: "bot",
              },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Nombre: ${Nombre}\n `,
                sender: "bot",
              },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Equipo: ${Equipo}\n `,
                sender: "bot",
              },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- ${UM}: ${Stock}\n `,
                sender: "bot",
              },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- En línea: ${En_linea}\n `,
                sender: "bot",
              },
            ]);
          });
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content:
                "No se encontraron registros en la base de datos. Reformule su pregunta o recargue la página.",
              sender: "bot",
            },
          ]);
        }
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content:
            "Error de conexión con el servidor, intentelo más tarde o comuníquese con el administrador",
          sender: "bot",
        },
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
          newQuestion.toUpperCase() +
          " Solo dame la query seleccionando Equipo, Nombre, UM,  Stock y En_linea, selecciona todas las filas que contengan la palabra, filtra por 'Nombre', solo dame la QUERY.",
      };

      const response = await openai.createCompletion(completeOptions);

      if (response.data.choices) {
        setQuery(response.data.choices[0].text);
      }

      setNewMessage("");
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content:
            "Error de conexión con el servidor, intentelo más tarde o comuníquese con el administrador",
          sender: "bot",
        },
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
            {/* <div className="chat-title">Asistente virtual</div> */}
            <button onClick={handleResetConversation}>
              Eliminar conversacion
            </button>
            <button onClick={getAllStock}>
              Stock General
            </button>
          </div>
          <h3 className="instruction">
            Guia para consultar: Ingresar palabra clave.
          </h3>
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

export default ChatStock;
