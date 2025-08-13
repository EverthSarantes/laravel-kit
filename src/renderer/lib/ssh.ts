// src/renderer/lib/ssh.ts

export async function openRemoteProject(ssh: {
  host: string;
  port: number;
  username: string;
  password: string;
  privateKey: string;
  projectPath: string;
}) {
  const command = `cd ${ssh.projectPath} && php artisan --format=json`;
  const result = await window.kit.runSSHCommand({
    host: ssh.host,
    port: ssh.port,
    username: ssh.username,
    password: ssh.password,
    privateKey: ssh.privateKey,
    projectPath: ssh.projectPath
  }, command);
  if (result && result.stdout) {
    const parsed = JSON.parse(result.stdout);
    return {
      ...parsed,
      ssh,
      isRemote: true,
      dir: '',
      name: 'Proyecto remoto'
    };
  } else {
    throw new Error(result.stderr || 'No se pudo obtener la información del proyecto remoto.');
  }
}

export async function runArtisanSSH(
  ssh: {
    host: string;
    port: number;
    username: string;
    password: string;
    privateKey: string;
    projectPath: string;
  },
  artisanArray: string[]
) {
  const command = `cd ${ssh.projectPath} && php artisan ${artisanArray.join(' ')}`;
  const result = await window.kit.runSSHCommand({
    host: ssh.host,
    port: ssh.port,
    username: ssh.username,
    password: ssh.password,
    privateKey: ssh.privateKey,
    projectPath: ssh.projectPath
  }, command);
  if (result && result.stdout) {
    return result.stdout;
  } else {
    return result.stderr || '';
  }
}
