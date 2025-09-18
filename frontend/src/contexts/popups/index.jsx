import { createContext, useContext, useState } from "react";

const PopUpContext = createContext();

const PopUpContextProvider = ({children}) => {
    const [popUps, setPopUps] = useState({
        category: false
    });

    return <PopUpContext.Provider value={{popUps, setPopUps}}>
        {children}
    </PopUpContext.Provider>
}

const usePopUp = () => {
    return useContext(PopUpContext);
}

export {
    usePopUp,
    PopUpContextProvider
}