import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  SimpleGrid,
  Text,
  Button,
  useColorModeValue,
  Flex,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";

const PlanCard = ({ plan }) => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" mb="6">
    <Flex justifyContent="space-between">
      <Heading mb={4}>{plan.plan_name}</Heading>
      <Badge px="2" colorScheme="teal">
        {plan.cost}$
      </Badge>
    </Flex>
    <Text mb={2}>GPT Words Limit: {plan.gpt_words_limit}</Text>
    {/* Display other plan properties as needed */}
    <Button
      colorScheme="blue"
      variant="outline"
      mt={4}
      onClick={() => alert(`Pay for plan: ${plan.plan_name}`)}
    >
      Choose Plan
    </Button>
  </Box>
);

const Plans = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("/api/plan/get_plans");
        if (response.data.success) {
          setPlans(response.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlans();
  }, []);

  return (
    <Box p={5}>
      <Heading mb={5}>Available Plans</Heading>
      <SimpleGrid columns={[1, null, 3]} spacing={10}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Plans;
