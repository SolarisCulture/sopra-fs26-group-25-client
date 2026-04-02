import { Modal } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <Modal
      title={<div style={{color: "#000"}}>Game Rules</div>}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <p>Your rules text here...</p>
    </Modal>
  );
}