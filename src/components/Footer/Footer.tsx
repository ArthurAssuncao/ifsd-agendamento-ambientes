export function Footer() {
  return (
    <footer className="bg-green-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>
          Instituto Federal do Sudeste de Minas Gerais - Campus Santos Dumont
        </p>
        <p className="mt-2 text-sm text-green-200">
          © {new Date().getFullYear()} IFSudesteMG Campus Santos Dumont - Todos
          os direitos reservados
        </p>
        <p className="mt-2 text-sm text-green-200">
          Criado por Arthur Assuncao
        </p>
      </div>
    </footer>
  );
}
