import { Button, Modal } from "antd";

interface QuitGameModalProps {
  open: boolean;
  onStay: () => void;
  onQuit: () => void;
}

export default function QuitGameModal({ open, onStay, onQuit }: QuitGameModalProps) {
  return (
    <Modal
      title={<div style={{ color: "#000" }}>Are you sure you want to quit the game?</div>}
      open={open}
      closable={false}
      footer={null}
      centered
    >
      <p>All players will be redirected back to the lobby.</p>
      <div style={{ display: "flex", justifyContent: "right", gap: 10, marginTop: "10px" }}>
        <Button
            onClick={onStay}>No, stay.
        </Button>
        <Button
            type="primary"
            onClick={onQuit}>
          Yes, quit.
        </Button>
      </div>
    </Modal>
  );
}