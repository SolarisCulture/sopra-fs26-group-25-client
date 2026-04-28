import { Modal, Input } from "antd";

interface DictionaryModalProps {
  open: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onSearch: () => void;
  onClose: () => void;
  result: { word: string; meanings: string[] } | null;
  resultOpen: boolean;
  onCloseResult: () => void;
}

export default function DictionaryModal({
  open, search, onSearchChange, onSearch, onClose,
  result, resultOpen, onCloseResult,
}: DictionaryModalProps) {
  return (
    <>
      <Modal title="Dictionary" open={open} onCancel={onClose} footer={null}>
        <div style={{ padding: "10px 0" }}>
          <p style={{ marginBottom: "8px", fontWeight: 500 }}>Search for a word:</p>
          <Input
            placeholder="Enter word..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onPressEnter={onSearch}
          />
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
            Press Enter to search.
          </p>
        </div>
      </Modal>

      <Modal
        title={`Definition: ${result?.word}`}
        open={resultOpen}
        onCancel={onCloseResult}
        footer={null}
      >
        {result?.meanings.map((meaning, index) => (
          <p key={index} style={{ marginBottom: 8 }}>{meaning}</p>
        ))}
      </Modal>
    </>
  );
}