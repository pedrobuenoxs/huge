import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
} from "@chakra-ui/react";

const DelBotModal = ({ isOpen, onClose, Bot, deleteBot }) => {
  return (
    <Box>
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Bot
            </AlertDialogHeader>

            <AlertDialogBody>
              Você tem certeza de que deseja excluir este bot?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                colorScheme="red"
                onClick={() => deleteBot(Bot.id)}
                ml={3}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export { DelBotModal };
