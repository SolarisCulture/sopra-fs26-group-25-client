import { Modal, Input } from "antd";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: string[];
}

interface DictionaryModalProps {
  open: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onSearch: () => void;
  onClose: () => void;
  result: { word: string; phonetic?: string; meanings: DictionaryMeaning[] } | null;
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
        title={
          <div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{result?.word}</span>
            {result?.phonetic && (
              <span style={{ fontSize: 14, color: "#888", marginLeft: 8 }}>
                {result.phonetic}
              </span>
            )}
          </div>
        }
        open={resultOpen}
        onCancel={onCloseResult}
        footer={null}
      >
        {result?.meanings.map((meaning, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#7B2D8B",
              textTransform: "capitalize",
              marginBottom: 4,
            }}>
              {meaning.partOfSpeech}
            </div>
            {meaning.definitions.map((def, j) => (
              <p key={j} style={{ margin: "2px 0 6px 12px", fontSize: 14 }}>
                {meaning.definitions.length > 1 ? `${j + 1}. ` : ""}{def}
              </p>
            ))}
          </div>
        ))}
      </Modal>
    </>
  );
}