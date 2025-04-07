import { read_file, FILE_OPERATIONS } from './file.js';
import * as name_generator from './generator.js'
import * as arg_handler from './arguments.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { normalize } from 'node:path';
import process from 'node:process';

let program_options = arg_handler.read_args();
if(program_options.file_arg === false) {
    arg_handler.show_help();
    process.exit(0);
}

let obfuscated_file_name = arg_handler.get_file_name_from_argv(program_options.file_arg_index)
let is_read = read_file(obfuscated_file_name);

switch(is_read.code) {
    case FILE_OPERATIONS.OP_NOT_SUPPORTED:
    case FILE_OPERATIONS.FILE_DOES_NOT_EXIST:
    case FILE_OPERATIONS.FAILED:
        console.log(`[-] Read operation failed.`);
        process.exit(1);
    case FILE_OPERATIONS.SUCCESS:
        console.log(`[-] Successfully read file ${obfuscated_file_name}.`);
        var file_content = is_read.data;
        break;  
}

const node = parse(
    file_content, 
    { ecmaVersion: "latest" } 
);

walk.simple(node, {
    VariableDeclaration(node) {
        console.log(node);
        console.log("Variable Declaration:", node.kind);
        node.declarations.forEach(declarator => {
            if (declarator.id && declarator.id.name) {
                console.log("  Variable name:", declarator.id.name);
            }
        });
    },
    FunctionDeclaration(node) {
        if (node.id && node.id.name) {
            console.log("Function Declaration:", node.id.name);
            console.log("  Params:", node.params.map(p => p.name).join(', '));
        }
    }
});
