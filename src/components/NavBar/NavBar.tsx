import ifLogoWite from "@/assets/img/if-white.svg";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src={ifLogoWite}
            alt="Logo IFSudesteMG"
            className="h-14 lg:h-10 w-auto"
          />
          <span className="font-semibold text-xl mr-8 text-center lg:text-left">
            IFSudesteMG Campus Santos Dumont
          </span>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-green-200 transition">
              Início
            </a>
            <a href="#" className="hover:text-green-200 transition">
              Ambientes
            </a>
            <a href="#" className="hover:text-green-200 transition">
              Regras
            </a>
            <a href="#" className="hover:text-green-200 transition">
              Contato
            </a>
          </div>
        </div>
        {status === "authenticated" ? (
          <div className="hidden md:flex items-center space-x-4">
            <span className="">
              Bem-vindo, {session?.user?.name || "Usuário"}
            </span>
            <Link
              href="/api/auth/signout"
              className="hover:text-green-200 transition"
            >
              Sair
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
