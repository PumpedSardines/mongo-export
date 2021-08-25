import * as path from "path";

export const paths = {
    application: path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), "/mongo-database-manager"),
}