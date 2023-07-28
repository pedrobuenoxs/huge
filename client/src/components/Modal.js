import React, { useContext, useRef } from "react";
import { ModalContext } from "../context/ModalContext";
import Login from "./Login";
import Register from "./Register";

function Modal() {
  const { modalOpen, closeModal, modalContent } = useContext(ModalContext);
  const modalRef = useRef();

  if (!modalOpen) {
    return null;
  }

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  return (
    <div className="modal" onClick={handleClickOutside}>
      <div className="modal-content" ref={modalRef}>
        <span className="close-button" onClick={closeModal}></span>
        {modalContent === "login" && <Login />}
        {modalContent === "register" && <Register />}
      </div>
    </div>
  );
}

export default Modal;
