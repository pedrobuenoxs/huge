import React from "react";
import {
  Box,
  Button,
  useToast,
  Flex,
  useColorModeValue,
  List,
  Badge,
  Text,
  Stat,
  StatNumber,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { DelInstanceModal } from "./DelModal";

const InstanceList = ({ userInstances, fetchUserInstances }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("blue.100", "white.900");
  const shadow = useColorModeValue("lg", "dark-lg");

  const deleteInstance = async (instanceId) => {
    try {
      await axios.delete(`api/sessions/delete/${instanceId}`);
      toast({
        title: "Instância excluída.",
        description: "A instância foi excluída com sucesso.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      fetchUserInstances();
    } catch (error) {
      toast({
        title: "Error.",
        description: "Erro ao excluir a instância.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  return (
    <List spacing={3} ml={5} mr={5}>
      {userInstances.map((instance) => (
        <Box flex="1" bg="white" p="6" shadow={shadow} borderRadius="lg">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            mb={4}
          >
            <Box>
              <Flex direction="column">
                <Text color="gray.500">ID:</Text>
                <Stat>
                  <StatNumber>{instance.client_id}</StatNumber>
                </Stat>
              </Flex>
              <Flex direction="column">
                <Text color="gray.500">Criado em:</Text>
                <Stat>
                  <StatNumber>
                    {new Date(instance.createdAt).toLocaleString("pt-BR")}
                  </StatNumber>
                </Stat>
              </Flex>
              <Flex direction="column">
                <Text color="gray.500">Status:</Text>
                <Stat>
                  <StatNumber>
                    <Badge fontSize="0.8em" colorScheme="green">
                      Ativo
                    </Badge>
                  </StatNumber>
                </Stat>
              </Flex>
            </Box>
            <Box alignSelf={{ base: "end", md: "center" }}>
              <Button
                leftIcon={<DeleteIcon />}
                onClick={onOpen}
                colorScheme="red"
              >
                Excluir
              </Button>
            </Box>
          </Flex>
          <DelInstanceModal
            isOpen={isOpen}
            onClose={onClose}
            instance={instance}
            deleteInstance={() => deleteInstance(instance.client_id)}
          />
        </Box>
      ))}
    </List>
  );
};

export { InstanceList };
