import React, { useState } from 'react';
import ChatContainer from './Component/ChatContainer';
import Login from './Component/Login';
import { AsistenteProvider } from './AsistenteContext';

function App() {
  // Estado para verificar si el usuario está autenticado
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = (status) => {
    // Cambiar el estado de autenticación a true si el status es true
    setUserAuthenticated(status);
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Cambiar el estado de autenticación a false
    setUserAuthenticated(false);
  };

  return (
    <AsistenteProvider>
      {/* Mostrar el componente de inicio de sesión si el usuario no está autenticado */}
      {!userAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ChatContainer />
      )}
    </AsistenteProvider>
  );
}

export default App;
