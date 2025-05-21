type ToastProps = {
    toast: {
      message: string;
      type: "success" | "error";
    } | null;
  };
  
  export default function Toast({ toast }: ToastProps) {
    if (!toast) return null;
  
    const baseClass =
      "fixed top-4 right-4 z-50 max-w-xs px-4 py-3 rounded-lg shadow-md border animate-slide-in";
    const successClass =
      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-300 dark:border-green-700";
    const errorClass =
      "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-300 dark:border-red-700";
  
    return (
      <div className={`${baseClass} ${toast.type === "success" ? successClass : errorClass}`}> 
        {toast.message}
      </div>
    );
  }
  