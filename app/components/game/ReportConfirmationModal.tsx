import { Modal, Button } from "antd";

interface Props {
  reportConfirmOpen: boolean;
  onCancel: (val: boolean) => void;
  onConfirm: () => void;
  currentClue: { word: string; count: number } | null;
}

export default function ReportConfirmModal({ reportConfirmOpen, onCancel, onConfirm, currentClue }: Props) {
  return (
            <Modal
                title={<div style={{ color: "#000", textAlign: "center", fontSize: 18, fontWeight: 700 }}>Report Clue</div>}
                open={reportConfirmOpen}
                onCancel={() => onCancel(false)}
                footer={null}
                width={480}
                centered
            >
                <div style={{ padding: "12px 0 8px", color: "#000" }}>
                    <p style={{ fontSize: 15, marginBottom: 20 }}>
                        Are you sure you want to report the clue <strong>&quot;{currentClue?.word}&quot;</strong>?
                        <br />
                        The opposing spymaster will be asked to rule on its validity.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <Button
                            onClick={() => onCancel(false)}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={onConfirm}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Yes, Report
                        </Button>
                    </div>
                </div>
            </Modal>
  );
}