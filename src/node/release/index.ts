import Client, { Options } from 'ftp';
import { readdirSync } from 'fs';
import { join } from 'path';
import { from, bindNodeCallback } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

console.log(`RELEASE ${process.env.NODE_ENV} ${process.env.FTP_USER}@${process.env.FTP_HOST}`);

console.log(`Network:`);

const DIST_PATH = `dist/cineworld-planner`;
const filesList = readdirSync(join(process.cwd(), DIST_PATH));

const client = new Client();

function pushFiles() {
    const putFile = bindNodeCallback(client.put.bind(client));

    from(filesList).pipe(
        mergeMap(fileName => {
            const localPath = join(process.cwd(), DIST_PATH, fileName);
            console.log(`Putting path ${localPath} to remote ${fileName}`);
            return putFile(localPath, fileName);
        }, 1)
    ).subscribe({
        complete: () => client.end()
    });
}

client.on('greeting', (message: string) => {
    console.log(`GREETING: ${message}`);
});

client.on('ready', () => {
    console.log(`READY`);
    pushFiles();
});

client.on('close', (error: boolean) => {
    console.log(`CONNECTION CLOSED (had error: ${error})`);
});

client.on('end', () => {
    console.log(`END`);
});

client.on('error', (error: any) => {
    const code = error.code || 'NO_CODE';

    console.log(`ERROR: ${code}`);

    console.log(error);

    console.log(JSON.stringify(error, undefined, 4));

    process.exit(1);
});

const connectOptions: Options = {
    user: process.env.FTP_USER,
    host: process.env.FTP_HOST,
    password: process.env.FTP_PASSWORD,
    connTimeout: 60000,
    pasvTimeout: 60000,
};

client.connect(connectOptions);
