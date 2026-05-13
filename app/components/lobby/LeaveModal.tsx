import { Button, Modal } from "antd";

interface ScriptProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function LeaveModal(
    {
        open,
        onStay,
        onLeave
    }: ScriptProps
) {
  return (
    <Modal
      title={<div style={{color: "#000"}}>Are you sure you want to leave the lobby?</div>}
      open={open}
      closable={false}
      footer={null}
    >
      <p>By leaving the lobby you return to the home page.</p>
      <div style={{display: "flex", justifyContent: "right", gap: 10, marginTop: "10px"}}>
        <Button onClick={onStay}>No, stay.</Button>
        <Button type="primary" onClick={onLeave}>Yes, leave.</Button>
      </div>
    </Modal>
  );
}