import { v4 as uuid } from "uuid";
import { promises as fs } from "fs";
import hidefile from "hidefile";
import * as path from "path";
import * as os from "os";

export default async function genTempDir(): Promise<[string, () => Promise<void>]> {
    const temp = path.resolve(os.tmpdir(), "." + uuid());

    await fs.rmdir(temp, { recursive: true }).catch(() => console.log("folder didn't exist"));
    await fs.mkdir(temp, { recursive: true });

    await new Promise<void>((resolve, reject) => hidefile.hide(temp, (err) => void (err ? reject() : resolve())));

    const deleteTemp = () => fs.rmdir(temp, { recursive: true }).catch(() => console.warn("no temp folder to delete"));

    const cleanup = async () => { await deleteTemp(); };

    process.on("SIGTERM", cleanup);
    process.on("SIGQUIT", cleanup);
    process.on("SIGABRT", cleanup);

    return [temp, deleteTemp];
}