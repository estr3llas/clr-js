import { read_file, FileOperations } from './file.js';
import * as name_generator from './generator.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { normalize } from 'node:path';
import process from 'node:process';

let is_read = read_file(process.argv[2]);

switch(is_read.code) {
    case FileOperations.OP_NOT_SUPPORTED:
    case FileOperations.FILE_DOES_NOT_EXIST:
    case FileOperations.FAILED:
        console.log(`[-] Read operation failed.`);
        process.exit(1);
    case FileOperations.SUCCESS:
        console.log(`[-] Successfully read file ${process.argv[2]}.`);
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

console.log(name_generator.get_new_const_name())
console.log(name_generator.get_new_const_name())
console.log(name_generator.get_new_const_name())
console.log(name_generator.get_new_const_name())
console.log(name_generator.get_new_const_name())