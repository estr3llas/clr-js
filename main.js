import { read_file, FILE_OPERATIONS } from './file.js';
import * as name_generator from './generator.js'
import * as arg_handler from './arguments.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { normalize } from 'node:path';
import process from 'node:process';
import escodegen from 'escodegen';

function getValueByKey(map, key) {
    const entry = [...map].find(([k, v]) => k === key);
    return entry ? entry[1] : undefined;
  }
//TODO: fix scoping
(function () {

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
            console.log(`[!] Successfully read file ${obfuscated_file_name}.`);
            var file_content = is_read.data;
            break;  
    }

    const node = parse(
        file_content, 
        { ecmaVersion: "latest" } 
    );

    const name_mapping = new Map();

    walk.simple(node, {
        VariableDeclaration(node) {
            node.declarations.forEach(declarator => {
                if (declarator.id && declarator.id.name) {
                    let original_name = declarator.id.name;
                    let new_name = '';

                    // If the variable declaration is a "const", it will be renamed to "const_N"
                    switch(node.kind) {
                        case 'const':
                            new_name = name_generator.get_new_const_name();
                            break;
                        default:
                            new_name = name_generator.get_new_variable_name();
                    }
                
                    console.log(`[+] Found variable: ${declarator.id.name}`);   
                    console.log(`    [i] Variable ${declarator.id.name} renamed to: ${new_name}`);

                    name_mapping.set(original_name, new_name)
                }
            });
        },
        FunctionDeclaration(node) {
            if (node.id && node.id.name) {

                let original_name = node.id.name;
                let new_name = name_generator.get_new_sub_name();;

                console.log(`[+] Found function: ${node.id.name} (${node.params.map(p => p.name).join(', ')})`);
                console.log(`    [i] Function ${node.id.name} renamed to: ${new_name}`);

                name_mapping.set(original_name, new_name)


                // Then, rename each of the function's parameters in the AST to the new name, that is, "aN"
                node.params.forEach(parameter => {
                    let original_name = parameter.name;
                    let new_name = name_generator.get_new_arg_name();

                    console.log(`    [i] Parameter ${parameter.name} renamed to: ${new_name}`);

                    name_mapping.set(original_name, new_name)
                })
            }
        },
        LabeledStatement(node) {
            if(node.label.name) {
                let original_name = node.label.name;
                let new_name = name_generator.get_new_label_name();

                console.log(`[+] Found label: ${node.label.name}`);
                console.log(`    [i] Label ${node.label.name} renamed to: ${new_name}`);

                name_mapping.set(original_name, new_name)
            }
        }
    });

    walk.simple(node, {
        Identifier(node) {
            if (name_mapping.has(node.name)) {
                node.name = name_mapping.get(node.name);
            }
        }
    });

    const generatedCode = escodegen.generate(node, {
        format: {
            indent: {
                style: '    ',
                base: 0
            },
            newline: '\n',
            space: ' ',
            quotes: 'auto'
        }
    });

    console.log(generatedCode);

})();
