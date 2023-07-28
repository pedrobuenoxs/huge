import React from "react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import WppBot from "../../pages/WppBot";
import BotPage from "../../pages/Bot";
import Plans from "../../pages/Plans";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, component: <Dashboard /> },
  { name: "Whatsapp Bot", icon: FiTrendingUp, component: <WppBot /> },
  { name: "Inteligencia Artificial ", icon: FiCompass, component: <BotPage /> },
  { name: "Planos", icon: FiStar, component: <Plans /> },
];

export default LinkItems;
