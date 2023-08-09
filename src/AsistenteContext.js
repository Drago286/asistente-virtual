import { useState, createContext } from "react";


const AsistenteContext = createContext();

export const AsistenteProvider = ({children}) => {

    const baseURL = "http://172.20.10.2:8000/api/";//<---Aqui va tu IP http://{tu ip}:8000/api/
    const API_KEY = "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";//<---Aqui va tu API_KEY

    return (
        <AsistenteContext.Provider 
        value={{baseURL,API_KEY}}>
            {children}
        </AsistenteContext.Provider>
    );
}
export default AsistenteContext;