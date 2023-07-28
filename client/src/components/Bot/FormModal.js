import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Select,
  HStack,
  IconButton,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { RiEmojiStickerFill } from "react-icons/ri";
import { EmojiPickerModal } from "./EmojiPickerModal";

import axios from "axios";

const BotFormModal = ({ isOpen, onClose, botToEdit }) => {
  const [name, setName] = useState("");
  const [trainingData, setTrainingData] = useState("");
  const [clientId, setClientId] = useState("");
  const [enableTyping, setEnableTyping] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [clientInstances, setClientInstances] = useState([]);
  const {
    isOpen: isEmojiModalOpen,
    onOpen: onEmojiModalOpen,
    onClose: onEmojiModalClose,
  } = useDisclosure();
  const toast = useToast();
  const isEditMode = Boolean(botToEdit); // Set edit mode if botToEdit is provided

  useEffect(() => {
    if (botToEdit) {
      setName(botToEdit.name);
      setTrainingData(botToEdit.train_data);
      setClientId(botToEdit.client_id);
      setEnableTyping(botToEdit.enable_typing);
      setSelectedEmoji(botToEdit.reaction);
    } else {
      setName("");
      setTrainingData("");
      setClientId("");
      setEnableTyping(false);
      setSelectedEmoji(null);
    }
  }, [botToEdit]);

  useEffect(() => {
    // Fetch client instances when the component mounts
    try {
      axios
        .get("api/sessions/get-users-instances")
        .then((response) => {
          console.log("response", response);
          if (response.data.success) {
            setClientInstances(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar instâncias de cliente", error);
          toast({
            title: "Erro ao buscar instâncias de cliente",
            description: error.message,
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        });
    } catch (error) {}
  }, [botToEdit]);

  const handleEmojiSelect = (emoji) => {
    console.log("emoji", emoji);
    setSelectedEmoji(emoji.native);
    onEmojiModalClose();
  };

  const handleSubmitBot = (event) => {
    event.preventDefault();

    let modalBody = {
      name,
      train_data: trainingData,
      client_id: clientId,
      enable_typing: enableTyping ? 1 : 0,
      reaction: selectedEmoji || "",
    };

    let axiosReq;
    if (isEditMode) {
      // If we're in edit mode, attach bot id to the request body
      modalBody.id = botToEdit.id;
      axiosReq = axios.put("/api/bot/edit-bot", modalBody);
      console.log("modalBody", modalBody);
    } else {
      axiosReq = axios.post("/api/bot/add-aibot", modalBody);
    }

    axiosReq
      .then((response) => {
        console.log("response", response);

        if (!response.data.success) {
          toast({
            title: isEditMode ? "Erro ao editar bot " : "Erro ao adicionar bot",
            description: response.data.msg,
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (response.data.success) {
          toast({
            title: isEditMode
              ? "Bot editado com sucesso"
              : "Bot adicionado com sucesso",
            description: response.data.msg,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
        }
      })
      .catch((error) => {
        console.error("Erro ao adicionar bot", error);
        toast({
          title: isEditMode ? "Erro ao editar bot" : "Erro ao adicionar bot",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmitBot} p={5}>
        <ModalHeader>Adicionar novo bot</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Nome</FormLabel>
            <Input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Prompt</FormLabel>
            <Textarea
              placeholder="Dados de Treinamento"
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>ID do Cliente</FormLabel>
            <Select
              placeholder="Selecione a instância do cliente"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {clientInstances &&
                clientInstances.map((instance) => (
                  <option value={instance.client_id} key={instance.id}>
                    {instance.client_id}
                  </option>
                ))}
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <HStack spacing={4} justifyContent={"space-between"}>
              <FormLabel>Habilitar digitação</FormLabel>
              <Switch
                size="lg"
                colorScheme="green"
                isChecked={enableTyping}
                onChange={(e) => setEnableTyping(e.target.checked)}
              />
            </HStack>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Reação</FormLabel>
            <HStack spacing={4} justifyContent={"space-between"}>
              <Box>{selectedEmoji}</Box>
              <IconButton
                aria-label="Select emoji"
                icon={<RiEmojiStickerFill />}
                onClick={onEmojiModalOpen}
                size={"lg"}
              />
            </HStack>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button type="submit" colorScheme="blue" mr={3}>
            Salvar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
      <EmojiPickerModal
        onEmojiSelect={handleEmojiSelect}
        isOpen={isEmojiModalOpen}
        onClose={onEmojiModalClose}
      />
    </Modal>
  );
};

export { BotFormModal };
