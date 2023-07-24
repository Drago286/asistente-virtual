import React, { useState } from "react";
//import "./ChangePassword.css"; // Agrega el archivo CSS para el estilo

const ChangePassword = () => {
  const [SAP, setSAP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      // Realiza la solicitud al backend para cambiar la contraseña
      const response = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SAP: SAP,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Contraseña cambiada exitosamente. Tu cuenta ha sido deshabilitada.");
      } else {
        setError("Ocurrió un error al cambiar la contraseña.");
      }
    } catch (error) {
        
        setError("Ocurrió un error en la solicitud.");
    }
  };

  return (
    <div className="ChangePassword">
      <div className="changepassword-container">
        <h2>Cambiar Contraseña</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="SAP">SAP</label>
            <input
              type="text"
              id="SAP"
              value={SAP}
              onChange={(e) => setSAP(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-changepassword">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
