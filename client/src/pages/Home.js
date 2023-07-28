import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { useDisclosure } from "@chakra-ui/react";

import LinkItems from "../components/Sidebar/LinkItems";
import { Sidebar } from "../components/Sidebar/Sidebar";

function Home() {
  const [activePage, setActivePage] = useState(LinkItems[0].component);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("logout");
    logout()
      .then((response) => {
        console.log("Deslogado com sucesso", response);
        navigate("/login");
      })
      .catch((error) => {
        console.log("Erro ao fazer logout", error);
      });
  };

  const renderDashboard = () => {
    return <>{activePage}</>;
  };

  return (
    <Sidebar
      renderDashboard={renderDashboard}
      onClose={onClose}
      isOpen={isOpen}
      onOpen={onOpen}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    />
  );
}

export default Home;
