import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  useToast,
  Container,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { BotFormModal } from "../components/Bot/FormModal";
import { BotList } from "../components/Bot/BotList"; // Import the BotList component

const BotManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("blue.100", "white.900");
  const shadow = useColorModeValue("lg", "dark-lg");
  const [botToEdit, setBotToEdit] = useState(null); // Add botToEdit state

  const [renderList, setRenderList] = useState(true); // Create the state variable

  const triggerOnClose = () => {
    onClose();
    setRenderList(!renderList); // Update the state when you want to re-render the list
  };

  return (
    <Container
      maxW="container.2xl"
      py="12"
      backgroundColor={bgColor}
      shadow={shadow}
      borderRadius="lg"
    >
      <Box ml={5}>
        <Heading mb={5}>Gerenciamento de Bots</Heading>
        <Button colorScheme="green" onClick={onOpen} leftIcon={<AddIcon />}>
          Novo bot
        </Button>
      </Box>
      <BotFormModal
        isOpen={isOpen}
        onClose={triggerOnClose}
        botToEdit={botToEdit}
        setBotToEdit={setBotToEdit}
      />
      <BotList
        setBotToEdit={setBotToEdit}
        onOpen={onOpen}
        renderList={renderList}
      />{" "}
      {/* Bot list */}
    </Container>
  );
};

export default BotManagement;
