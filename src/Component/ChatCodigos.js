import React, { useState, useRef, useEffect, useContext } from "react";
import { Configuration, OpenAIApi } from "openai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import AsistenteContext from "../AsistenteContext";

import "./CSS/ChatCodigos.css";

function ChatCodigos() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [replyApi, setReplyApi] = useState([]);
  const { API_KEY } = useContext(AsistenteContext);
  const { baseURL } = useContext(AsistenteContext);
  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase =
    "En contexto a una tabla llamada codigos con las siguientes columnas Codigo,Descripcion_del_Evento,Limitaciones_del_Evento,Deteccion_de_la_Informacion,Guia_para_la_Deteccion_de_Fallas,Equipo, genera una query segun la consulta de mi usuario, pero en tu respuesta solo quiero la query, evita agregar tus idicaciones:";

    /**
     * Configuracion inicial del openAI
     */
  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  /**
   * 
   * @param {*} query 
   * Funcion que envia Query generada autamaticamente por la AI a la API, retornarno la informacion en un JSON, luego es analizada y desplegada al usuario.
   */
  const sendQueryToAPI = async (query) => {
    console.log(query);
    try {
      const response = await fetch(baseURL + "execute-query-codigos", {
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
            var Detección_de_la_lnformacion =
              objeto.Deteccion_de_la_Informacion || "";
            var Guia_para_la_Detección_de_Fallas =
              objeto.Guia_para_la_Deteccion_de_Fallas || "";

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Deteccion: ${Detección_de_la_lnformacion}\n `,
                sender: "bot",
              },
            ]);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                content: `- Guia: ${Guia_para_la_Detección_de_Fallas}\n `,
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

  /**
   * Funcion que envia la consulta a la AI
   * @param {*} newQuestion 
   * @returns Query que sera enviada a la API
   */
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
          " Solo dame la query seleccionando Deteccion_de_la_Informacion, Guia_para_la_Deteccion_de_Fallas, filtra según el CAEX que se indique el cual puede ser 830, 930E2 y 930E4, interpreta CAEX como Equipo a la hora de hacer la query.",
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

  /**
   * Funcion que vacia el arrat de mensajes.
   */
  const handleResetConversation = () => {
    setMessages([]);
    setNewMessage("");
  };

  /**
   * Funcion que permite al usuario activar el reconociemiento de voz
   */
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

  /**
   * Comienzo del reconomiento de voz de voz
   */
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

  /**
   * Detencion del reconocimiento de voz
   */
  const stopRecognition = () => {
    if (recognition.current) {
      recognition.current.stop();
      isRecording.current = false;
    }
  };

  /**
   * Funcion que envia el mensaje una vez se presione "ENTER"
   * @param {*} event 
   * 
   */
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
            Guia para consultar: "Codigo n° del CAEX (830 - 930E2 - 930E4)"
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

export default ChatCodigos;
