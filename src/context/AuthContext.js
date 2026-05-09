import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const normalizeRole = (role) => {
    if (!role) return null;
    return role.toUpperCase().replace("ROLE_", "");
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("userToken");

        if (storedUser) {
            const parsed = JSON.parse(storedUser);

            setUser({
                ...parsed,
                role: normalizeRole(parsed.role),
            });
        }

        if (storedToken) {
            setToken(storedToken);
        }

        setLoading(false);
    }, []);

    const login = (userData, jwt) => {
        const fixedUser = {
            ...userData,
            role: normalizeRole(userData.role),
        };

        setUser(fixedUser);
        setToken(jwt);

        localStorage.setItem("user", JSON.stringify(fixedUser));
        localStorage.setItem("userToken", jwt);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("userToken");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);