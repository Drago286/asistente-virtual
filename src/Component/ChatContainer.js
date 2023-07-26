import React, { useState } from "react";
import ChatReportes from "./ChatReportes";
import ChatCodigos from "./ChatCodigos";

function ChatContainer() {
  const [showChatReportes, setShowChatReportes] = useState(true);

  const handleToggleChat = () => {
    setShowChatReportes((prevShowChat) => !prevShowChat);
  };

  return (
    <div>
      {/* Botones para cambiar entre los chats */}
      <div className="button-container-1">
        <button onClick={handleToggleChat}>
          Reportes
        </button>
        <button onClick={handleToggleChat}>
          Codigos
        </button>
      </div>

      {/* Mostrar el chat activo (ChatReportes o ChatCodigos) */}
      {showChatReportes ? <ChatReportes /> : <ChatCodigos />}
    </div>
  );
}

export default ChatContainer;
