import fs from 'fs';

export const read_file = (filename) => {
    if(!fs.existsSync(filename)) {
        return 'FILE_NOT_FOUND';
    }

    // https://nodejs.org/api/fs.html#fsreadfilesyncpath-options
    if (process.platform == 'FreeBSD' && fs.lstatSync(filename).isDirectory()) {
        return 'OP_NOT_SUPPORTED';
    }

    try {
        const buffer =  fs.readFileSync(filename, 'utf8').trim();
        return buffer;
    } catch (err) {
        return 'FAILED'
    }
}

export const write_to_file = (filename, code) => {
    fs.writeFile(filename, code, (err) => { if (err) throw err; });
}