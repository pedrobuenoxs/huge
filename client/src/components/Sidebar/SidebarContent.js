import React from "react";
import { Link } from "react-router-dom";
import {
  VStack,
  Flex,
  Text,
  Icon,
  Button,
  useColorModeValue,
  CloseButton,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import NavItem from "./NavItem";
import LinkItems from "./LinkItems";

function SidebarContent({ onClose, setActivePage, handleLogout, ...rest }) {
  return (
    <VStack
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      spacing="1"
      align="stretch"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Link href="/dashboard">
          <Text
            fontSize="2xl"
            fontFamily="monospace"
            fontWeight="bold"
            bg="lightblue"
            px={2}
            href="/dashboard"
          >
            BotFly
          </Text>
        </Link>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          setActivePage={setActivePage}
          component={link.component}
          onClose={onClose}
        >
          {link.name}
        </NavItem>
      ))}
      <Button
        leftIcon={<Icon as={FiLogOut} />}
        onClick={() => handleLogout()}
        pos={"fixed"}
        bottom={15}
        mx="10"
      >
        Logout
      </Button>
    </VStack>
  );
}

export { SidebarContent };
