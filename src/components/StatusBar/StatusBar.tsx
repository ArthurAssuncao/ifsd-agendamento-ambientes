import { useSession } from "next-auth/react";

export function StatusBar() {
  const { data: session, status } = useSession();

  if (!session || status !== "authenticated") {
    return null; // Don't render the status bar if not authenticated
  }

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 text-white w-full">
      <div className="flex items-center gap-4 flex-1">
        <span className="text-sm">Usuário: {session.user?.name}</span>
        <span className="text-sm">E-mail: {session.user?.email}</span>
      </div>
      <div className="flex items-center justify-center gap-4 flex-1">
        <span className="text-sm">Status: </span>
        <span className="text-green-500">Online</span>
      </div>
      <div className="flex items-center justify-end gap-4 flex-1">
        <span className="text-sm">
          Last updated: {new Date().toLocaleTimeString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
