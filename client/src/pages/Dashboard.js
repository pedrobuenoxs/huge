import React, { useState, useEffect } from "react";
import {
  Box,
  Skeleton,
  Stack,
  Stat,
  StatNumber,
  Container,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Link,
} from "@chakra-ui/react";

const Dashboard = () => {
  const [dash, setDash] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/get_dash")
      .then((response) => response.json())
      .then((data) => {
        setDash(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erro:", error);
        setIsLoading(false);
      });
  }, []);

  const bgColor = useColorModeValue("blue.100", "white.900");
  const shadow = useColorModeValue("lg", "dark-lg");

  return (
    <>
      {!isLoading && !dash?.plan && (
        <Alert status="warning" mb={5}>
          <AlertIcon />
          Você ainda não escolheu um plano!
        </Alert>
      )}
      <Container
        maxW="container.2xl"
        py="12"
        backgroundColor={bgColor}
        shadow={shadow}
        borderRadius="lg"
      >
        <Heading as="h1" mb={6} ml={5}>
          Status
        </Heading>

        <Stack direction={["column", "row"]} spacing={6} ml={2}>
          <Skeleton isLoaded={!isLoading} borderRadius="lg">
            <Box flex="1" bg="white" p="6" shadow={shadow} borderRadius="lg">
              <Text color="gray.500" fontSize="sm" mb="2">
                Plano
              </Text>
              <Stat>
                <StatNumber>
                  {dash?.plan ? dash.plan.plan_name : "N/A"}
                </StatNumber>
              </Stat>
            </Box>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} borderRadius="lg">
            <Box flex="1" bg="white" p="6" shadow={shadow} borderRadius="lg">
              <Text color="gray.500" fontSize="sm" mb="2">
                WhatsApps ativos
              </Text>
              <Stat>
                <StatNumber>{dash?.instance}</StatNumber>
              </Stat>
            </Box>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} borderRadius="lg">
            <Box flex="1" bg="white" p="6" shadow={shadow} borderRadius="lg">
              <Text color="gray.500" fontSize="sm" mb="2">
                Bots ativos
              </Text>
              <Stat>
                <StatNumber>{dash?.bots}</StatNumber>
              </Stat>
            </Box>
          </Skeleton>
        </Stack>

        {dash?.plan && (
          <>
            <Heading as="h1" mb={6} ml={5} mt={5}>
              Limites
            </Heading>
            <Stack direction={["column", "row"]} spacing={6} ml={2} mt={6}>
              <Skeleton isLoaded={!isLoading}>
                <Box
                  flex="1"
                  bg="white"
                  p="6"
                  shadow={shadow}
                  borderRadius="lg"
                >
                  <Text color="gray.500" fontSize="sm" mb="2">
                    Limite do WA bot
                  </Text>
                  <Stat>
                    <StatNumber>{dash.plan.wa_bot}</StatNumber>
                  </Stat>
                </Box>
              </Skeleton>
              <Skeleton isLoaded={!isLoading}>
                <Box
                  flex="1"
                  bg="white"
                  p="6"
                  shadow={shadow}
                  borderRadius="lg"
                >
                  <Text color="gray.500" fontSize="sm" mb="2">
                    Limite de palavras GPT
                  </Text>
                  <Stat>
                    <StatNumber>{dash.plan.gpt_words_limit}</StatNumber>
                  </Stat>
                </Box>
              </Skeleton>
            </Stack>
          </>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
