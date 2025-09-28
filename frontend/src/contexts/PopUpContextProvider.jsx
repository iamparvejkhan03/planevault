import { createContext, useContext, useState } from "react";

const PopUpContext = createContext();

const PopUpContextProvider = ({ children }) => {
    const [activePopups, setActivePopups] = useState({});

    // Open a specific popup
    const openPopup = (popupName) => {
        setActivePopups(prev => ({
            ...prev,
            [popupName]: true
        }));
    };

    // Close a specific popup
    const closePopup = (popupName) => {
        setActivePopups(prev => ({
            ...prev,
            [popupName]: false
        }));
    };

    // Toggle a popup (open if closed, close if open)
    const togglePopup = (popupName) => {
        setActivePopups(prev => ({
            ...prev,
            [popupName]: !prev[popupName]
        }));
    };

    // Close all popups
    const closeAllPopups = () => {
        setActivePopups({});
    };

    // Check if a specific popup is open
    const isPopupOpen = (popupName) => {
        return !!activePopups[popupName];
    };

    const value = {
        activePopups,
        openPopup,
        closePopup,
        togglePopup,
        closeAllPopups,
        isPopupOpen
    };

    return (
        <PopUpContext.Provider value={value}>
            {children}
        </PopUpContext.Provider>
    );
};

const usePopUp = () => {
    const context = useContext(PopUpContext);
    if (!context) {
        throw new Error('usePopUp must be used within a PopUpContextProvider');
    }
    return context;
};

export {
    usePopUp,
    PopUpContextProvider
};