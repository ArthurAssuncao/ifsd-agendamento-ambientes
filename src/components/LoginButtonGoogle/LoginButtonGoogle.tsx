import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export function LoginButtonGoogle() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors hover:cursor-pointer"
    >
      <div className="mr-2">
        <FaGoogle />
      </div>
      Entrar com Google institucional
    </button>
  );
}
