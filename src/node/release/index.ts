import { AccessOptions, Client } from 'basic-ftp';
import { readdirSync } from 'fs';
import { join } from 'path';

console.log(`RELEASE ${process.env.NODE_ENV} ${process.env.FTP_USER}@${process.env.FTP_HOST}`);

console.log(`Network:`);

const DIST_PATH = `dist/cineworld-planner`;
const filesList = readdirSync(join(process.cwd(), DIST_PATH));

const client = new Client(60000);

async function pushFiles() {
    for (const fileName of filesList) {
        const localPath = join(process.cwd(), DIST_PATH, fileName);
        console.log(`Putting path ${localPath} to remote ${fileName}`);
        await client.uploadFrom(localPath, fileName);
    }
}

const connectOptions: AccessOptions = {
    user: process.env.FTP_USER,
    host: process.env.FTP_HOST,
    password: process.env.FTP_PASSWORD,
};

async function release() {
    try {
        await client.access(connectOptions);
        await pushFiles();
    } finally {
        client.close();
    }
}

release().catch(error => {
    console.error(error);
    process.exit(1);
});
