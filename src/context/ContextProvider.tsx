import React, { useState, createContext, useContext } from 'react';

interface StateContextProps {
    showSideBar: boolean;
    setShowSideBar: any;
    loading: boolean;
    setLoading: any;
    role: 'Parent' | 'Student' | 'Teacher' | null;
    setRole: any;
    hasChanges: boolean;
    setHasChanges: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    // global
    const [showSideBar, setShowSideBar] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    let user: any = localStorage.getItem("user")
    user = JSON.parse(user)
    
    //    const [userRole, setUserRole] = useState<"Parent" | "Student" | "Teacher" | null>(user.userType||"Student");
    const [role, setRole] = useState<'Parent' | 'Student' | 'Teacher' | null>(user?.userType || null);

    return (
        <StateContext.Provider value={{
            showSideBar,
            setShowSideBar,
            loading,
            setLoading,
            role,
            setRole,
            hasChanges,
            setHasChanges,
            isModalOpen,
            setIsModalOpen
        }} >
            {props.children}
        </StateContext.Provider>
    )

};

export const UseStateContext = () => {
    const context = useContext(StateContext);

    if (!context) {
        console.log('useContext must be used within a StateContextProvider');
    }

    return context as StateContextProps;
};