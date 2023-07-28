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

const DelInstanceModal = ({ isOpen, onClose, instance, deleteInstance }) => {
  return (
    <Box>
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir instância
            </AlertDialogHeader>

            <AlertDialogBody>
              Você tem certeza de que deseja excluir esta instância?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                colorScheme="red"
                onClick={() => deleteInstance(instance.id)}
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

export { DelInstanceModal };
