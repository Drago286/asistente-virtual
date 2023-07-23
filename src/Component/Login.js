import React, { useState } from 'react';
import './Login.css'; // Agrega el archivo CSS para el estilo

const Login = ({ onLoginSuccess }) => {
  const [SAP, setSAP] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Realiza la solicitud al backend con las credenciales ingresadas
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SAP: SAP,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Si la solicitud es exitosa, cambia el estado de autenticación en el componente App a true
        onLoginSuccess(true);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Ocurrió un error en la solicitud.');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="SAP">SAP</label>
          <input type="text" id="SAP" value={SAP} onChange={(e) => setSAP(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-login">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
