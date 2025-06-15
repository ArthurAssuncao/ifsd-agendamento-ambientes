import { lastVersion } from "@/lib/version";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type StatusBarProps = {
  lastUpdateTime: number;
};

export function StatusBar({ lastUpdateTime }: StatusBarProps) {
  const { data: session, status } = useSession();
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    if (session || status !== "unauthenticated") {
      lastVersion()
        .then((v: string) => {
          setVersion(v);
        })
        .catch((error) => {
          console.error("Erro ao obter a versão:", error);
          setVersion("1.0.0");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session || status !== "authenticated") {
    return null; // Don't render the status bar if not authenticated
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-gray-800 p-4 text-white w-full flex-wrap">
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 flex-1">
        <span className="text-sm min-w-24">Usuário: {session.user?.name}</span>
        <span className="text-sm">E-mail: {session.user?.email}</span>
      </div>
      <div className="flex items-center justify-center gap-4 flex-1">
        <span className="text-sm hidden lg:flex">Status: </span>
        <span className="text-green-500 hidden lg:flex">Online</span>
      </div>
      <div className="flex items-center lg:justify-end gap-4 flex-1">
        {lastUpdateTime && (
          <span className="text-sm hidden lg:flex">
            Last updated: {new Date(lastUpdateTime).toLocaleTimeString("pt-BR")}
          </span>
        )}
        <span className="text-sm">Versão: {version}</span>
      </div>
    </div>
  );
}
