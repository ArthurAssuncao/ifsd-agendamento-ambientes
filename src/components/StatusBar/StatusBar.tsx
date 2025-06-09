import { lastVersion } from "@/lib/version";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function StatusBar() {
  const { data: session, status } = useSession();
  const [version, setVersion] = useState<string>();

  if (!session || status !== "authenticated") {
    return null; // Don't render the status bar if not authenticated
  }

  lastVersion()
    .then((v: string) => {
      setVersion(v);
    })
    .catch((error) => {
      console.error("Erro ao obter a versão:", error);
      setVersion("1.0.0");
    });

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
        <span className="text-sm">Versão: {version}</span>
      </div>
    </div>
  );
}
