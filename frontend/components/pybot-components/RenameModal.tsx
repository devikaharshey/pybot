import axios from "axios";
import { Button } from "@/components/ui/button";
import { SessionType } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Props = {
  showRenameModal: boolean;
  newSessionName: string;
  setNewSessionName: (val: string) => void;
  setShowRenameModal: (val: boolean) => void;
  sessionToRename: string | null;
  sessions: SessionType[];
  setSessions: (val: SessionType[]) => void;
  setShowMenu: (val: string | null) => void;
  setToast: (val: { message: string; type: "success" | "error" }) => void;
};

export default function RenameModal({
  showRenameModal,
  newSessionName,
  setNewSessionName,
  setShowRenameModal,
  sessionToRename,
  sessions,
  setSessions,
  setShowMenu,
  setToast,
}: Props) {
  if (!showRenameModal) return null;

  const handleRename = async () => {
    if (!sessionToRename || !newSessionName.trim()) return;

    try {
      await axios.patch(`${API_BASE}/api/chats/${sessionToRename}`, {
        name: newSessionName,
      });

      setSessions(
        sessions.map((s) =>
          s.id === sessionToRename ? { ...s, name: newSessionName } : s
        )
      );

      setShowRenameModal(false);
      setShowMenu(null);
      setToast({ message: "Chat renamed successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to rename session", error);
      setToast({ message: "Failed to rename session.", type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Rename Chat</h2>
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Enter new name"
          className="w-full mb-4 p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setShowRenameModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!newSessionName.trim()}
          >
            Rename
          </Button>
        </div>
      </div>
    </div>
  );
}
