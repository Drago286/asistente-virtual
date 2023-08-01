import React, { useState } from "react";
import ChangePassword from "./ChangePassword";
import Register from "./Register";
import "./Login.css"; // Agrega el archivo CSS para el estilo

const Login = ({ onLoginSuccess }) => {
  const [SAP, setSAP] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para indicar si la solicitud está en progreso
  const [error, setError] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [accountApproval, setAccountApproval] = useState(false);
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
   

    // Si la solicitud ya está en progreso, no hacer nada
    if (loading) {
      return;
    }

    if (!SAP || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true); // Marcar que la solicitud está en progreso

    try {
      // Realiza la solicitud al backend con las credenciales ingresadas
      const response = await fetch("http://172.20.10.2:8000/api/loginApi", {
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
        if (data.status === "habilitado") {
          onLoginSuccess(true);
        } else {
          setAccountApproval(true); // Establecer el estado accountApproval en true
          setShowApprovalMessage(true); // Establecer el estado showApprovalMessage en true
        }
      } else if (response.status === 404 && data.error === "usuario_no_encontrado") {
        setError("Usuario no encontrado");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (error) {
      setError("Ocurrió un error en la solicitud.");
    }

    setLoading(false); // Marcar que la solicitud ha finalizado
  };

  const toggleRegisterForm = () => {
    setShowRegisterForm(!showRegisterForm);
  };

  const handleBackToLogin = () => {
    setAccountApproval(false);
    setShowApprovalMessage(false);
  };

  const handleShowChangePasswordForm = () => {
    setShowChangePasswordForm(true);
    setShowRegisterForm(false);
    setShowApprovalMessage(false);
  };

  const handleCancelChangePassword = () => {
    setShowChangePasswordForm(false);
  };
  const handleRegisterSuccess = () => {
    // Cerrar el formulario de registro y mostrar el mensaje de aprobación
    setShowRegisterForm(false);
    setAccountApproval(true);
    setShowApprovalMessage(true);
  };
  return (
    <div className="Login">
      <div className="login-container">
        {showChangePasswordForm ? (
          <>
            <ChangePassword />
            <button onClick={handleCancelChangePassword}>
              Volver al inicio de sesión
            </button>
          </>
        ) : showApprovalMessage && accountApproval ? (
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
              <Register onRegisterSuccess={handleRegisterSuccess} />
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
                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? 'Cargando...' : 'Iniciar sesión'}
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
  
            <p className="forgot-password-link">
              <button onClick={handleShowChangePasswordForm}>
                Olvidé mi contraseña
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
  
};

export default Login;
