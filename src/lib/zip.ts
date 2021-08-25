import archiver from "archiver";
import unzipper from "unzipper";
import { createReadStream, createWriteStream } from "fs";

/**
 * Zips a folder
 * @param source Path to the folder to zip 
 * @param out Path to the zip file
 */
export async function zip(source: string, out: string): Promise<void> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = createWriteStream(out);

    return await new Promise<void>((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

/**
 * Unzips a zipfile
 * @param source Path to zipfile to unzip
 * @param out Path to folder to create
 */
export async function unzip(source: string, out: string): Promise<void> {
    return await createReadStream(source)
        .pipe(unzipper.Extract({ path: out }))
        .on('entry', entry => entry.autodrain())
        .promise();
}