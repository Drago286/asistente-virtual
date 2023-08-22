import { useState, createContext } from "react";

// Crear un nuevo contexto llamado AsistenteContext
const AsistenteContext = createContext();

// Definir un proveedor de contexto llamado AsistenteProvider
export const AsistenteProvider = ({children}) => {

     // Definir las constantes baseURL y API_KEY con los valores correspondientes
    const baseURL = "1.1.1.1";//<---Aqui va tu IP http://{tu ip}:8000/api/
    const API_KEY = "";//<---Aqui va tu API_KEY

    return (
        <AsistenteContext.Provider 
        value={{baseURL,API_KEY}}>
            {children}
        </AsistenteContext.Provider>
    );
}
export default AsistenteContext;