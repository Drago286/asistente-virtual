import React, { useState, useRef, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./ChatReportes.css";

function ChatReportes() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recordedMessage, setRecordedMessage] = useState("");
  const [query, setQuery] = useState("");
  const [userReply, setUserReply] = useState("");
  const [replyApi, setReplyApi] = useState([]);

  const recognition = useRef(null);
  const isRecording = useRef(false);
  const mensajeBase =
    "En contexto a una tabla llamada Fallas con las siguientes columnas Equipo,Fecha Inicio,Hora Inicio,Fecha Final,Hora Final,Duracion,Duracion Excel,Codigo,Categoria	Descripcion,Comentario	Caidas,Tipo Mant.,Código,Sistema,Sub Sistem.,Componentes,Equipo	Sistema,Componente,Horas,Mes,Motor,Flota, genera una query segun la consulta de mi usuario, pero en tu respuesta solo quiero la query, evita agregar tus idicaciones:";

  const API_KEY = "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"; // Replace with your valid API key

  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  /*
  const readReply = (replyApi) => {

      setMessages((prevMessages) => [
        ...prevMessages,
        { content: "Aquí tienes la lista de elementos:", sender: "bot" },
      ]);
      console.log(replyApi);

      replyApi.forEach(function (objeto) {

        var componente = objeto.Componentes || objeto.Componente || "";
        var comentario = objeto.Comentario || "";
        var fechaInicio = objeto.Fecha_Inicio || "";
        var fechaFinal = objeto.Fecha_Final || "";

        var fila = `- Componente: ${componente}\n  Comentario: ${comentario}\n  Fecha de inicio: ${fechaInicio}\n  Fecha final: ${fechaFinal}\n`;

        setMessages((prevMessages) => [
          ...prevMessages,
          { content: fila, sender: "bot" },
        ]);
      });

      //setReplyApi([]);
    
  };
  */

  const sendQueryToAPI = async (query) => {
    console.log(query);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/execute-query", {
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

          setMessages((prevMessages) => [
            ...prevMessages,
            { content: '----------------------------------------------------------', sender: "bot" },

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
          
        });
      }else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: "No se encontraron registros.", sender: "bot" },
        ]);
        }
      }
     
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: toString(error), sender: "bot" },
      ]);
    }
  };

  const handleSendMessage = async (newQuestion) => {

    try{
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
          " Solo dame la query seleccionando Equipo, Fecha_Inicio, Fecha_Final, Componentes, Comentario. No tomes en cuenta tus respuestas anteriores, evita utilizar DATEADD, si se trata de filtar por fechas usa DATE_SUB, ten en consideracion que estamos en el año 2023",
      };
  
      const response = await openai.createCompletion(completeOptions);
  
      if (response.data.choices) {
        setQuery(response.data.choices[0].text);
      }
  
      setNewMessage("");
    }
    catch(error) {
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
        <div> <div className="chat-header">
          <div className="chat-title">Asistente virtual</div>
          <button onClick={handleResetConversation}>
            <FontAwesomeIcon icon={faTrash} />
          </button></div>
        <h3 className="instruction">Guia para consultar:</h3>
         
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
          <div class="button-container">
  <button onClick={() => handleSendMessage(newMessage)}>Enviar</button>
  <button onClick={handleVoiceRecognition}>
    {isRecording.current ? "Detener" : "Grabar"}
  </button>
</div>

          
        </div>
      </div>
    </div>
  );
}

export default ChatReportes;
