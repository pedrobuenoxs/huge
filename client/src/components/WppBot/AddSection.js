import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  useToast,
  FormControl,
  Flex,
  FormLabel,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { QrCodeModal } from "./AddModal";

const AddSection = ({ fetchUserInstances }) => {
  const [instanceName, setInstanceName] = useState("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const checkNameBeforeOpen = () => {
    if (instanceName === "") {
      toast({
        title: "Atenção.",
        description: "Adicione um nome a sua instância",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    onOpen();
  };

  const shadow = useColorModeValue("lg", "dark-lg");

  return (
    <Box>
      <Flex
        justify="space-between"
        alignItems="center"
        ml={5}
        mr={5}
        backgroundColor={"white"}
        p={5}
        borderRadius="lg"
        shadow={shadow}
      >
        <FormControl isRequired>
          <FormLabel>Nome da instância</FormLabel>
          <Input
            placeholder="Nome"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            width="80%"
          />
        </FormControl>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={checkNameBeforeOpen}
          ml={0}
        >
          Add Bot
        </Button>
        <QrCodeModal
          isOpen={isOpen}
          onClose={onClose}
          instanceName={instanceName}
          fetchUserInstances={fetchUserInstances}
        />
      </Flex>
    </Box>
  );
};

export { AddSection };
