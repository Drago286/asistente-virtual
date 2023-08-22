import React, { useState } from "react";
import ChatReportes from "./ChatReportes";
import ChatCodigos from "./ChatCodigos";
import ChatStock from "./ChatStock";

function ChatContainer() {
  // Estados para controlar qué chat está activo
  const [showChatReportes, setShowChatReportes] = useState(true);
  const [showChatStock, setShowChatStock] = useState(false);

   // Función para cambiar entre los chats
  const handleToggleChat = (chatType) => {
    if (chatType === "reportes") {
      setShowChatReportes(true);
      setShowChatStock(false);
    } else if (chatType === "codigos") {
      setShowChatReportes(false);
      setShowChatStock(false);
    } else if (chatType === "stock") {
      setShowChatReportes(false);
      setShowChatStock(true);
    }
  };

  return (
    <div>
      {/* Botones para cambiar entre los chats */}
      <div className="button-container-1">
        <button onClick={() => handleToggleChat("reportes")}>
          Reportes
        </button>
        <button onClick={() => handleToggleChat("codigos")}>
          Codigos
        </button>
        <button onClick={() => handleToggleChat("stock")}>
          Stock
        </button>
      </div>

      {/* Mostrar el chat activo (ChatReportes, ChatCodigos o ChatStock) */}
      {showChatReportes ? (
        <ChatReportes />
      ) : showChatStock ? (
        <ChatStock />
      ) : (
        <ChatCodigos />
      )}
    </div>
  );
}

export default ChatContainer;
