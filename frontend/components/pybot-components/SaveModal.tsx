import { Button } from "@/components/ui/button";
import { SessionType } from "@/lib/types";

type Props = {
  showSaveModal: boolean;
  setShowSaveModal: (val: boolean) => void;
  sessionToSave: string | null;
  sessions: SessionType[];
  setToast: (val: { message: string; type: "success" | "error" }) => void;
};

export default function SaveModal({
  showSaveModal,
  setShowSaveModal,
  sessionToSave,
  sessions,
  setToast,
}: Props) {
  if (!showSaveModal) return null;

  const handleSave = () => {
    if (!sessionToSave) return;
    const session = sessions.find((s) => s.id === sessionToSave);
    if (session) {
      const content = session.chat
        .map(
          (msg) => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`
        )
        .join("\n\n");
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${session.name || session.id}.txt`;
      link.click();
      setToast({ message: "Chat saved successfully!", type: "success" });
    }
    setShowSaveModal(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-6">Save Chat</h2>
        <p className="mb-6">Do you want to save this chat?</p>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
