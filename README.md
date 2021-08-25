# mongo database manager
This project is a tool to download and download large mongodb databases. For when you want to take backups / switch server / delete mongodb.

## How to use
Download mongo-export from "releases". Start by adding mongo-export to your path, then from the terminal call:

```
mongo-export download --file "file-i-want-to-store" --database database-i-want-to-download
```
To download the database into a the file "file-i-want-to-store". To upload it again call:
```
mongo-export upload --file "file-i-want-to-store" --database database-i-want-to-download
```
This will upload the exported "file-i-want-to-store" into the database "database-i-want-to-download"

## Options
```
-f, --file <file>          file to export / import to
-d, --database <database>  database to download / upload
-a, --auth <auth>          Authentication (example: "username:password")
-h, --host <host>          mongodb host (default: "127.0.0.1")
-p, --port <port>          mongodb port (default: "27017")
```