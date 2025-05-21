import { Button } from "@/components/ui/button";

type Props = {
  showConfirm: boolean;
  setShowConfirm: (val: boolean) => void;
  handleDelete: () => void;
};

export default function ConfirmModal({ showConfirm, setShowConfirm, handleDelete }: Props) {
  if (!showConfirm) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete this chat?</p>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
