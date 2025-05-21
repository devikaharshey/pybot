import { MoreHorizontal } from "lucide-react";
import { Message, SessionType } from "@/lib/types";

type Props = {
  sessions: SessionType[];
  setSessionId: (id: string | null) => void;
  setChatHistory: (msgs: Message[]) => void;
  setSidebarOpen: (open: boolean) => void;
  showMenu: string | null;
  setShowMenu: (menu: string | null) => void;
  handleRename: (id: string) => void;
  handleSave: (id: string) => void;
  setShowConfirm: (show: boolean) => void;
  setSessionToDelete: (id: string | null) => void;
  sidebarOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
};

export default function Sidebar({
  sessions,
  setSessionId,
  setChatHistory,
  setSidebarOpen,
  showMenu,
  setShowMenu,
  handleRename,
  handleSave,
  setShowConfirm,
  setSessionToDelete,
  sidebarOpen,
  dropdownRef,
}: Props) {
  return (
    <aside
      className={`bg-gray-100 dark:bg-gray-900 h-full fixed top-0 left-0 z-30 transition-transform duration-300 ease-in-out w-64 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hidden">
        <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 p-4 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Recent Chats</h2>
        </div>

        <div className="p-4 pt-2">
          {sessions.map((s) => (
            <div key={s.id} className="mb-2 flex flex-row relative">
              <button
                className="w-full text-left truncate"
                onClick={() => {
                  setSessionId(s.id);
                  const chatHistory = Array.isArray(s.chat)
                    ? s.chat.map((msg) => ({
                        sender: msg.sender,
                        text: msg.text,
                      }))
                    : [];
                  setChatHistory(chatHistory);
                  setSidebarOpen(false);
                }}
              >
                {s.name ||
                  (s.chat?.length && s.chat[0]?.sender === "user"
                    ? s.chat[0].text.slice(0, 30)
                    : "New Chat")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(s.id === showMenu ? null : s.id);
                }}
                className="ml-2 text-gray-600"
              >
                <MoreHorizontal />
              </button>
              {showMenu === s.id && (
                <div
                  ref={dropdownRef}
                  className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg right-0 mt-2 w-40 z-50"
                >
                  <button
                    onClick={() => handleRename(s.id)}
                    className="block w-full text-left px-4 py-2 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleSave(s.id)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setSessionToDelete(s.id);
                      setShowConfirm(true);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-b-lg text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
