import * as path from "path";

export const paths = {
    application: (pkg: boolean): string => {

        if(!pkg) {
            return __dirname;
        }
        
        return path.resolve(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), "/mongo-database-manager");
    },
};