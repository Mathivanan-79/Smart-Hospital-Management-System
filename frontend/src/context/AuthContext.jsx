import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {

    if (!token) {
      setRole(null);
      setUsername(null);
      return;
    }

    try {

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setUsername(payload.sub);
      setRole(payload.role);

    } catch (error) {

      console.error("Invalid JWT token");

      localStorage.removeItem("token");
      setToken(null);
      setRole(null);
      setUsername(null);
    }

  }, [token]);

  const login = (jwtToken) => {

    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        username,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}