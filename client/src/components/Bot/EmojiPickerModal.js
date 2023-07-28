import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

const EmojiPickerModal = ({ isOpen, onClose, onEmojiSelect }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Selecione uma reação</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Picker data={data} onEmojiSelect={onEmojiSelect} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { EmojiPickerModal };
