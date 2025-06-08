import Image from "next/image";

import logoIFSD from "@/assets/img/logo_horizontal_santosdumont-1.png";

import { LoginButtonGoogle } from "@/components/LoginButtonGoogle";

export function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <Image
          src={logoIFSD}
          alt="Logo IFSudesteMG Campus Santos Dumont"
          className="h-32 w-auto mx-auto"
          width={500}
          height={100}
          // onError={(e) => {
          //   e.target.onerror = null;
          //   e.target.src = "https://via.placeholder.com/150?text=IFSD+Logo";
          // }}
        />
        <h1 className="text-4xl font-bold text-green-800 mt-4">
          Agendamento de Ambientes
        </h1>
        <div className="flex flex-col items-center mt-6">
          <LoginButtonGoogle />
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 space-y-6 text-gray-700">
        <h2 className="text-2xl font-semibold text-green-800">
          Sobre o Sistema
        </h2>
        <p>
          O sistema de agendamento de ambientes do IFSudesteMG Campus Santos
          Dumont permite que estudantes, professores e funcionários reservem
          salas, laboratórios e outros espaços de forma rápida e organizada.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-green-700 mb-2">Facilidade</h3>
            <p>
              Reserve qualquer ambiente do campus com apenas alguns cliques.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-green-700 mb-2">Transparência</h3>
            <p>Visualize a disponibilidade dos ambientes em tempo real.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-green-700 mb-2">Organização</h3>
            <p>Evite conflitos de agendamento e otimize o uso dos espaços.</p>
          </div>
        </div>
      </div>
    </>
  );
}
