import { Client, ConnectConfig } from 'ssh2';

export interface SSHCredentials {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export function runSSHCommand(
  credentials: SSHCredentials,
  command: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '';
    let stderr = '';

    const config: ConnectConfig = {
      host: credentials.host,
      port: credentials.port || 22,
      username: credentials.username,
    };
    if (credentials.password) config.password = credentials.password;
    if (credentials.privateKey) config.privateKey = credentials.privateKey;

    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          stream
            .on('close', (code: number, signal: string) => {
              conn.end();
              resolve({ stdout, stderr });
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString();
            });
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .connect(config);
  });
}
