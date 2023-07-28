import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react"

const AuthContext = createContext();

function useAuth(){
  const [authed, setAuthed] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/user/get-user-by-token", {
          withCredentials: true,
        });
        if (response.data.success === true) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (error) {
        console.log(error);
        setAuthed(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  


  const login = async (email, password) => {
      try {
        const response = await axios.post("/api/user/login", {
          email,
          password,
        });

        if(response.status === 500){
          throw new Error("Server Error");
        }
        if (response.data.msg === "No token found") {
          setAuthed(false);
        }
        if (response.data.success) {
          console.log("login method is working)")
          setAuthed(true);
        }
      } catch (error) {
        console.log(error);
        setAuthed(false);
      } finally {
        setLoading(false);
      }
  }

  const logout = async () => {
    try {
      const response = await axios.get("/api/user/logout", {
        withCredentials: true, // This is needed to include the cookie in the request
      });
      if (response.data.success) {
        console.log("logout method is working)")
        setAuthed(false);
      }
    } catch (error) {
      console.log(error);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  return { authed, login, logout, isLoading }
}


function AuthProvider ({ children }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function RequireAuth({ children }) {
  const { authed, isLoading } = useContext(AuthContext);

  if (isLoading === true) {
    return <Flex justifyContent="center" alignItems="center" height="100vh"><Spinner size="xl" /></Flex>;
    
  }

  return authed ? children : <Navigate to="/login" replace />;
}


export default function AuthConsumer() { return React.useContext(AuthContext)};

export { AuthProvider, RequireAuth, useAuth, AuthContext };
