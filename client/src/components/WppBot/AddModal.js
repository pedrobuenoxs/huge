import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const QrCodeModal = ({ isOpen, onClose, instanceName, fetchUserInstances }) => {
  const toast = useToast();
  const [qrCode, setQrCode] = useState(null);

  const fetchUserInstancesOnClose = async () => {
    await fetchUserInstances();
    onClose();
  };

  const addInstance = async () => {
    try {
      const response = await axios.post("/api/sessions/add", {
        id: instanceName,
        isLegacy: "True",
      });
      console.log(response.data);
      if (response.data.success) {
        toast({
          title: "Criado com sucesso.",
          description: response.data.message,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setQrCode(response.data.data.qr);
        fetchUserInstances();
      } else {
        toast({
          title: "Erro ao criar instância.",
          description: response.data.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: "Erro ao criar instancia.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={fetchUserInstancesOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Prepare seu celular</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {qrCode ? (
            <img src={qrCode} alt="QR code" />
          ) : (
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/your_video_link"
              title="Your tutorial video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" m={"auto"} onClick={addInstance}>
            Next
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { QrCodeModal };
