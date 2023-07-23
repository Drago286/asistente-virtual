import React, { useState } from 'react';
import ChatReportes from './Component/ChatReportes';
import Login from './Component/Login'; // Importa el componente de inicio de sesión


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
    <>
      {/* Mostrar el componente de inicio de sesión si el usuario no está autenticado */}
      {!userAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Mostrar el componente ChatReportes si el usuario está autenticado
        <ChatReportes onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
