import React, { useState } from "react";
import Register from "./Register";
import "./Login.css"; // Agrega el archivo CSS para el estilo

const Login = ({ onLoginSuccess }) => {
  const [SAP, setSAP] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [accountApproval, setAccountApproval] = useState(false);
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      // Realiza la solicitud al backend con las credenciales ingresadas
      const response = await fetch("http://localhost:8000/api/loginApi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SAP: SAP,
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Verificar el estado del usuario antes de permitir el inicio de sesión
        console.log(data);
        if (data.status === "habilitado") {
          onLoginSuccess(true);
        } else {
          setAccountApproval(true); // Establecer el estado accountApproval en true
          setShowApprovalMessage(true); // Establecer el estado showApprovalMessage en true
        }
      } else {
        setError("Credenciales inválidas");
      }
    } catch (error) {
      setError("Ocurrió un error en la solicitud.");
    }
  };
  
  

  const toggleRegisterForm = () => {
    setShowRegisterForm(!showRegisterForm);
  };

  const handleBackToLogin = () => {
    setAccountApproval(false);
    setShowApprovalMessage(false);
  };

  return (
    <div className="Login">
      <div className="login-container">
        {showApprovalMessage && accountApproval ? (
          <>
            <h2>Proceso de aprobación en curso</h2>
            <p>
              Tu cuenta se encuentra en proceso de aprobación. Por favor,
              inténtalo de nuevo más tarde.
            </p>
            <button onClick={handleBackToLogin}>
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <>
            {!showRegisterForm ? <h2>Iniciar sesión</h2> : <h2></h2>}
            {error && <p className="error-message">{error}</p>}
            {showRegisterForm ? (
              <Register />
            ) : (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="SAP">SAP</label>
                  <input
                    type="text"
                    id="SAP"
                    value={SAP}
                    onChange={(e) => setSAP(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-login">
                  Iniciar sesión
                </button>
              </form>
            )}
            {showRegisterForm ? (
              <p className="register-link">
                ¿Ya tienes una cuenta?{" "}
                <button onClick={toggleRegisterForm}>Inicia sesión aquí</button>
              </p>
            ) : (
              <p className="register-link">
                ¿No tienes una cuenta?{" "}
                <button onClick={toggleRegisterForm}>Registrarse aquí</button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;