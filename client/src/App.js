import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./context/AuthContext"; // Path should lead to the file where AuthContext is defined
import Dashboard from "./pages/Home";
import { ChakraProvider } from "@chakra-ui/react";
import Login from "./components/Login";
import Signup from "./components/Register";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/dashboard/*"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
