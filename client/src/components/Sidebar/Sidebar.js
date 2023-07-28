import {
  Box,
  Drawer,
  DrawerContent,
  useColorModeValue,
} from "@chakra-ui/react";
import { SidebarContent } from "./SidebarContent";
import { MobileNav } from "./MobileNav";

function Sidebar({
  renderDashboard,
  onClose,
  isOpen,
  onOpen,
  setActivePage,
  handleLogout,
}) {
  let bg = useColorModeValue("gray.100", "gray.900");
  return (
    <Box minH="100vh" bg={bg}>
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent
            onClose={onClose}
            setActivePage={setActivePage}
            handleLogout={handleLogout}
          />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {renderDashboard()}
      </Box>
    </Box>
  );
}

export { Sidebar };
