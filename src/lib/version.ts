// Configuração do repositório diretamente no arquivo
const GITHUB_CONFIG = {
  owner: "facebook", // Altere aqui para o usuário/organização desejada
  repo: "react", // Altere aqui para o repositório desejado
  branch: "main", // Altere aqui para a branch desejada
};

export type LastCommitInfo = {
  date: string | null;
  hash: string | null;
  shortHash: string | null;
  message: string | null;
  author: string | null;
  error: string | null;
};

export type LastCommitInfoError = {
  message: string;
  documentation_url: string;
  status: string;
};

export const getLastCommitInfo = async (
  owner: string,
  repo: string,
  branch = "main"
): Promise<LastCommitInfo> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Adicione seu token aqui se precisar de mais requests por hora
          // 'Authorization': 'token YOUR_GITHUB_TOKEN'
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      date: data.commit.author.date,
      hash: data.sha,
      shortHash: data.sha.substring(0, 7),
      message: data.commit.message.split("\n")[0], // Primeira linha da mensagem
      author: data.commit.author.name,
      error: null,
    };
  } catch (error: unknown) {
    return {
      date: null,
      hash: null,
      shortHash: null,
      message: null,
      author: null,
      error: (error as LastCommitInfoError).message,
    };
  }
};

function convertToCustomFormat(isoDate: string) {
  const date = new Date(isoDate);

  const year = date.getFullYear() - 2000;
  const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because getMonth() returns 0-11
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `1.${year}.${month}.${day}.${hour}${minute}${second}`;
}

export const lastVersion = async (): Promise<string> => {
  const { owner, repo, branch } = GITHUB_CONFIG;
  const info = await getLastCommitInfo(owner, repo, branch);
  let version;
  if (info.date) {
    version = convertToCustomFormat(info.date);
  }
  return version ? version : "1.0.0";
};
