import process from 'node:process';

export const PROGRAM_OPTIONS = {
    // The plan is to, well, add more features in the near future
    file_arg: false,
    file_arg_index: 0,

    output_arg: false,
    output_arg_index: 0
}

export const read_args = () => {
    process.argv.forEach((val, index) => {
        if(val.includes('-f') || val.includes('--file')){
            PROGRAM_OPTIONS.file_arg = true;
            PROGRAM_OPTIONS.file_arg_index = index;
        }

        if(val.includes('-o') || val.includes('--output')) {
            PROGRAM_OPTIONS.output_arg = true;
            PROGRAM_OPTIONS.output_arg_index = index;
        }
    })
    return PROGRAM_OPTIONS
}

export const get_file_name_from_argv = (idx) => {
    return process.argv[idx + 1] || null;
}

export const show_help = () => {
    console.log(`
        CLR-JS
        Rename variables previously renamed by "obfuscator.io", that is, renaming "_0x1234" into "v1", for example.
        This process helps the manual deobfuscation of such obfuscated scripts.

        Usage:
                node clr.js -f [obfuscated.js]

        Options:

        -f, --file          The .js file
        -o, --output        The output file (default is to print on console)
        `)
}
