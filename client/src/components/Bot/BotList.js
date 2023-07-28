import React, { useEffect, useState } from "react";
import { Box, Text, Button, VStack, HStack, useToast } from "@chakra-ui/react";
import { BotCard } from "./BotCard";

import axios from "axios";

const BotList = ({ setBotToEdit, onOpen, renderList }) => {
  const [bots, setBots] = useState([]);
  const toast = useToast();

  const fetchBots = async () => {
    try {
      const res = await axios.get("/api/bot/get-bots");
      if (!res.data.success)
        return toast({
          title: "Erro ao buscar bots",
          description: res.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      console.log(res.data);
      setBots([...res.data.data]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // Fetch bots
    fetchBots().then(() => {
      console.log("Bots fetched");
    });
  }, [renderList]);

  return (
    <VStack spacing={4} ml={5} mr={5} align="stretch" mt={5}>
      {bots.map((bot) => (
        <BotCard
          key={bot.id}
          bot={bot}
          setBotToEdit={setBotToEdit}
          onOpen={onOpen}
          fetchBots={fetchBots}
        />
      ))}
    </VStack>
  );
};

export { BotList };
