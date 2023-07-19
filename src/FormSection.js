import React, { useState, useRef, useEffect } from "react";

const FormSection = ({ generateResponse }) => {
    const [newQuestion, setNewQuestion] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      generateResponse(newQuestion, setNewQuestion);
    };
  
    return (
      <form className="form-section" onSubmit={handleSubmit}>
        <textarea
          rows="5"
          className="form-control"
          placeholder="Ask me anything..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        ></textarea>
        <button className="btn" type="submit">
          Generate Response 🤖
        </button>
      </form>
    );
  };
  
  export default FormSection;