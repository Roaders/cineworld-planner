import Client from 'ftp';
import { readdirSync } from 'fs';
import { join, basename } from 'path';
import { from, bindNodeCallback } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

console.log(`RELEASE ${process.env.FTP_HOST}  ${process.env.FTP_USER} ${process.env.FTP_PASSWORD}`);

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

    // client.put(
    //     join(process.cwd(), DIST_PATH, filesList[0]),
    //     filesList[0],
    //     () => client.end()
    //     );
}

client.on('ready', () => {
    pushFiles();
});

client.connect({
    user: process.env.FTP_USER,
    host: process.env.FTP_HOST,
    password: process.env.FTP_PASSWORD
});
