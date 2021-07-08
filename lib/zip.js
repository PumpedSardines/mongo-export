const archiver = require('archiver');
const unzipper = require("unzipper");

module.exports = {
    zip: (source, out) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = require("fs").createWriteStream(out);

        return new Promise((resolve, reject) => {
            archive
                .directory(source, false)
                .on('error', err => reject(err))
                .pipe(stream);

            stream.on('close', () => resolve());
            archive.finalize();
        });
    },
    unzip: async (source, out) => {
        return await require("fs").createReadStream(source)
            .pipe(unzipper.Extract({ path: out }))
            .on('entry', entry => entry.autodrain())
            .promise();
    }
}