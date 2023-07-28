import { useEffect, useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Switch,
  Tooltip,
  useDisclosure,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { DelBotModal } from "./DelBotModal";
import axios from "axios";

const BotCard = ({ bot, setBotToEdit, onOpen, fetchBots }) => {
  const [status, setStatus] = useState(bot.active);
  const {
    isOpen: isOpenDelModal,
    onOpen: onOpenDelModal,
    onClose: onCloseDelModal,
  } = useDisclosure();

  const toast = useToast();

  const onEditBot = (bot) => {
    onOpen();
    setBotToEdit(bot);
  };

  useEffect(() => {
    async function fetch() {
      await fetchBots();
    }
    fetch();
  }, [status]);

  const handleDeleteBot = async (id) => {
    try {
      const res = await axios.post("/api/bot/del-bot", { id });

      if (res.data.success) {
        fetchBots();
        onCloseDelModal();
        toast({
          title: "Bot excluído",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeStatus = async (id, status) => {
    // Optimistically set status in UI
    setStatus(status);
    const reqStatus = status ? 1 : 0;
    try {
      const response = await axios.post("/api/bot/change-status", {
        id,
        status: reqStatus,
      });
      console.log(response);
      if (response.data.success) {
        toast({
          title: "Status alterado",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Rollback status in case of failure
        setStatus(!status);
      }
    } catch (error) {
      // Rollback status in case of error
      setStatus(!status);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      key={bot.id}
      w="100%"
      p={4}
      shadow="md"
      borderRadius="md"
      bg="white"
      marginBottom="4"
    >
      <HStack
        justifyContent={["flex-end", "space-between"]}
        direction={["column", "row"]}
        wrap="wrap"
      >
        <VStack alignItems="flex-start" spacing={2}>
          <Text fontWeight="bold">
            {bot.name} - {bot.client_id}
          </Text>
          <Text fontSize="sm">{bot.train_data}</Text>
          <Badge colorScheme={bot.enable_typing ? "green" : "red"}>
            {bot.enable_typing ? "Digitação Ativada" : "Digitação Desativada"}
          </Badge>
          <Text fontSize="sm">Reação: {bot.reaction}</Text>
        </VStack>
        <VStack>
          <HStack spacing={2}>
            <Tooltip label="Editar Bot" fontSize="sm">
              <IconButton
                colorScheme="yellow"
                aria-label="Edit Bot"
                icon={<EditIcon />}
                onClick={() => onEditBot(bot)}
              />
            </Tooltip>
            <Tooltip label="Excluir Bot" fontSize="sm">
              <IconButton
                colorScheme="red"
                aria-label="Delete Bot"
                icon={<DeleteIcon />}
                onClick={onOpenDelModal}
              />
            </Tooltip>
          </HStack>
          <HStack>
            <Text fontSize="sm">{status ? "Ativo" : "Inativo"}</Text>
            <Switch
              colorScheme="green"
              isChecked={status}
              onChange={(e) => {
                console.log("e target", e.target.checked);
                handleChangeStatus(bot.id, e.target.checked);
              }}
            />
          </HStack>
        </VStack>
        <DelBotModal
          isOpen={isOpenDelModal}
          onClose={onCloseDelModal}
          Bot={bot}
          deleteBot={handleDeleteBot}
        />
      </HStack>
    </Box>
  );
};

export { BotCard };
