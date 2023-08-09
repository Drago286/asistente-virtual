import React, { useState, useRef, useEffect, useContext } from "react";
import { Configuration, OpenAIApi } from "openai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import AsistenteContext from "../AsistenteContext";

import "./CSS/ChatReportes.css";

function ChatReportes() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [replyApi, setReplyApi] = useState([]);
  const { API_KEY } = useContext(AsistenteContext);
  const { baseURL } = useContext(AsistenteContext);
  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase =
    "En contexto a una tabla llamada Fallas con las siguientes columnas Equipo,Fecha Inicio,Hora Inicio,Fecha Final,Hora Final,Duracion,Duracion Excel,Codigo,Categoria	Descripcion,Comentario	Caidas,Tipo Mant.,Código,Sistema,Sub Sistem.,Componentes,Equipo	Sistema,Componente,Horas,Mes,Motor,Flota, genera una query segun la consulta de mi usuario, pero en tu respuesta solo quiero la query, evita agregar tus idicaciones:";
  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const sendQueryToAPI = async (query) => {
    console.log(query);
    try {
      const response = await fetch(baseURL + "execute-query", {
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
          setMessages((prevMessages) => [
            ...prevMessages,
            { content: "Aquí tienes la lista de elementos:", sender: "bot" },
          ]);

          data.forEach(function (objeto) {
            var componente = objeto.Componentes || objeto.Componente || "";
            var equipo = objeto.Equipo || objeto.Equipo || "";
            var comentario = objeto.Comentario || "";
            var fechaInicio = objeto.Fecha_Inicio || "";
            var fechaFinal = objeto.Fecha_Final || "";
            var duracion = objeto.Duracion || "";

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: "----------------------------------",
                sender: "bot",
              },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Equipo: ${equipo}\n `, sender: "bot" },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Componente: ${componente}\n `, sender: "bot" },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Comentario: ${comentario}\n `, sender: "bot" },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Fecha inicio: ${fechaInicio}\n `, sender: "bot" },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Fecha final: ${fechaFinal}\n `, sender: "bot" },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { content: `- Duración: ${duracion}\n `, sender: "bot" },
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
          newQuestion +
          " Solo dame la query seleccionando Equipo, Fecha_Inicio, Fecha_Final, Componentes, Comentario y Duracion. No tomes en cuenta tus respuestas anteriores, evita utilizar DATEADD, si se trata de filtar por fechas usa DATE_SUB, ten en consideracion que estamos en el año 2023.",
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
          <h3 className="instruction">
            Guia para consultar: "Dame las ultimas 10 caidas del equipo 150" -
            "Dame las caidas de los ultimos 3 dias". Siempre refierace a Equipo,
            y (si corresponde) especificar el nombre del mes.
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

export default ChatReportes;
