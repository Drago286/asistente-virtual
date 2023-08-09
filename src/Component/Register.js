import React, { useState, useContext } from "react";
import AsistenteContext from "../AsistenteContext";

const Register = ({ onRegisterSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [SAP, setSAP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { baseURL } = useContext(AsistenteContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (loading) {
      return;
    }

    if (!SAP || !password || !name || !confirmPassword || !email) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(baseURL+"register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          SAP: SAP,
          password: password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Llamar a la función onRegisterSuccess para notificar al componente Login
        onRegisterSuccess();
      } else {
        if (data.error.SAP) {
          setError("SAP ya registrado");
        }
        if (data.error.email) {
          setError("Correo ya registrado");
        }

        // setError("Ocurrió un error en el registro");
         console.log(data);
      }
    } catch (error) {
      console.log(toString(error));
      setError("Ocurrió un error en la solicitud.");
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? "Cargando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};

export default Register;
