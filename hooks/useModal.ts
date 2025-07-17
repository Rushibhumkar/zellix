import { useCallback, useState } from "react";

const useModal = () => {
    const [visible, setVisible] = useState(false);
    const openModal = useCallback(() => setVisible(true), []);
    const closeModal = useCallback(() => setVisible(false), []);
    return { visible, openModal, closeModal }
}

export default useModal;