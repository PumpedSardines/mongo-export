const { v4: uuid } = require("uuid");
const fs = require("fs").promises;
const hidefile = require('hidefile');
const path = require("path");

module.exports = async () => {
    const temp = path.resolve(process.cwd(), "." + uuid());

    await fs.rmdir(temp, { recursive: true }).catch(_ => console.log("folder didn't exist"));
    await fs.mkdir(temp, {
        recursive: true,
        IS_HIDDEN: true
    });

    hidefile.hideSync(temp);

    const deleteTemp = () => fs.rmdir(temp, { recursive: true }).catch(_ => console.log("folder didn't exist"));

    process.on('SIGTERM', async () => {
        await deleteTemp()
    });

    return [temp, deleteTemp];
}