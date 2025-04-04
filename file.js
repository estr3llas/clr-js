import fs from 'fs';

export const FileOperations = Object.freeze({
    SUCCESS: 0,
    FAILED: 1,
    OP_NOT_SUPPORTED: 2,
    FILE_DOES_NOT_EXIST: 3 
});

export const read_file = (filename) => {
    if(!fs.existsSync(filename)) {
        return {
            code: FileOperations.FILE_DOES_NOT_EXIST,
            data: ''
        }
    }

    // https://nodejs.org/api/fs.html#fsreadfilesyncpath-options
    if (process.platform == 'FreeBSD' && fs.lstatSync(filename).isDirectory()) {
        return {
            code: FileOperations.OP_NOT_SUPPORTED,
            data: ''
        }
    }

    let buffer = fs.readFileSync(filename, 'utf8').trim();

    if(!buffer) {
        return {
            code: FileOperations.FAILED,
            data: ''
        }
    }

    return {
        code: FileOperations.SUCCESS,
        data: buffer
    }
}