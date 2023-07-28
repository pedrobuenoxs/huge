import React, { useState, useEffect } from "react";
import {
  Heading,
  useToast,
  Skeleton,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import axios from "axios";
import { AddSection } from "../components/WppBot/AddSection";
import { InstanceList } from "../components/WppBot/InstanceList";

const WppBots = () => {
  const [userInstances, setUserInstances] = useState([]);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInstances = async () => {
    try {
      const response = await axios.get("/api/sessions/get-users-instances");
      if (response.data.success) {
        setUserInstances(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: "An error occurred while fetching the user instances.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInstances();
  }, []);

  const bgColor = useColorModeValue("blue.100", "white.900");
  const shadow = useColorModeValue("lg", "dark-lg");
  return (
    <Container
      maxW="container.2xl"
      py="12"
      backgroundColor={bgColor}
      shadow={shadow}
      borderRadius="lg"
    >
      <Heading as="h1" mb={6} ml={5}>
        Gerencie seus Whatsapp's
      </Heading>
      <AddSection fetchUserInstances={fetchUserInstances} />

      <Heading as="h1" size="md" mt={5} ml={5}>
        Whatsapp's ativos
      </Heading>
      <Skeleton isLoaded={!isLoading} borderRadius="lg" mt={5}>
        <InstanceList
          userInstances={userInstances}
          fetchUserInstances={fetchUserInstances}
        />
      </Skeleton>
    </Container>
  );
};

export default WppBots;
