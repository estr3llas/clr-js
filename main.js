import { read_file, write_to_file } from './file.js';
import * as name_generator from './generator.js'
import * as arg_handler from './arguments.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import process from 'node:process';
import escodegen from 'escodegen';

(function () {

    let program_options = arg_handler.read_args();
    if(program_options.file_arg === false) {
        arg_handler.show_help();
        process.exit(0);
    }

    let obfuscated_file_name = arg_handler.get_file_name_from_argv(program_options.file_arg_index)
    let file_buffer = read_file(obfuscated_file_name);
    let errorMessage = null;

    switch(file_buffer) {
        case 'FILE_NOT_FOUND':
            errorMessage = `[-] The file ${obfuscated_file_name} was not found.`;
            break;
        case 'OP_NOT_SUPPORTED':
            errorMessage = `[-] Operation not supported on ${process.platform}.`;
            break;
        case 'FAILED':
            errorMessage = `[-] Operation failed.`;
            break;
    }

    if (errorMessage) {
        console.log(errorMessage);
        process.exit(0);
    }
    
    const ast = parse(
        file_buffer, 
        {   
            ecmaVersion: "latest",
            sourceType: "module"
        }
    );

    const name_mapping = new Map();

    walk.full(ast, (node) => {
        switch(node.type) {
            case 'VariableDeclarator': {
                if (node.id.type === 'Identifier' && !name_mapping.has(node.id.name)) {
                    let original_name = node.id.name;
                    let new_name = '';
        
                    let declarationKind = '';
                    walk.ancestor(node, (ancestor) => {
                        if (ancestor.type === 'VariableDeclaration') {
                            declarationKind = ancestor.kind;
                        }
                    });
        
                    switch (declarationKind) {
                        case 'const':
                            new_name = name_generator.get_new_const_name();
                            break;
                        default:
                            new_name = name_generator.get_new_variable_name();
                    }
        
                    console.log(`[+] Found variable: ${original_name}`);
                    console.log(`    [i] Variable ${original_name} renamed to: ${new_name}`);
                    name_mapping.set(original_name, new_name);
                }
                break;
            }
            case 'FunctionDeclaration': {
                if (node.id && node.id.type === 'Identifier' && !name_mapping.has(node.id.name)) {
                    let original_name = node.id.name;
                    let new_name = name_generator.get_new_sub_name();

                    console.log(`[+] Found function: ${original_name} (${node.params.map(p => p.name).join(', ')})`);
                    console.log(`    [i] Function ${original_name} renamed to: ${new_name}`);
                    name_mapping.set(original_name, new_name);

                    node.params.forEach(param => {
                        if (param.type === 'Identifier' && !name_mapping.has(param.name)) {
                            let original_param_name = param.name;
                            let new_param_name = name_generator.get_new_arg_name();
                            console.log(`    [i] Parameter ${original_param_name} renamed to: ${new_param_name}`);
                            name_mapping.set(original_param_name, new_param_name);
                        }
                    });
                }
                break;
            }
            case 'LabeledStatement': {
                if (node.label.type === 'Identifier' && !name_mapping.has(node.label.name)) {
                    let original_name = node.label.name;
                    let new_name = name_generator.get_new_label_name();
        
                    console.log(`[+] Found label: ${original_name}`);
                    console.log(`    [i] Label ${original_name} renamed to: ${new_name}`);
                    name_mapping.set(original_name, new_name);
                }
                break;
            }
            case 'CallExpression':
                if (node.callee.type === 'FunctionExpression') {
                    node.callee.params.forEach(param => {
                        if (param.type === 'Identifier' && !name_mapping.has(param.name)) {
                            const new_name = name_generator.get_new_arg_name();
                            console.log(`[+] Found IIFE parameter: ${param.name} renamed to: ${new_name}`);
                            name_mapping.set(param.name, new_name);
                        }
                    });
                }
                break;
            case 'ImportDefaultSpecifier':
            case 'ImportNamespaceSpecifier': 
                if(!name_mapping.has(node.local.name)){
                    console.log(node)
                    let original_name = node.local.name;
                    let new_name = name_generator.get_new_import_name();
        
                    console.log(`[+] Found import: ${original_name}`);
                    console.log(`    [i] Import ${original_name} renamed to: ${new_name}`);
                    name_mapping.set(original_name, new_name);
                }
                break;                
        }
    });
    
    walk.full(ast, (node) => {
        if (node.type === 'Identifier' && name_mapping.has(node.name)) {
            node.name = name_mapping.get(node.name);
        }
    });

    const generated_code = escodegen.generate(ast, {
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

    if(program_options.output_arg === false) {
        console.log("[+] Renamed Output:");
        console.log(generated_code);
        process.exit(0);
    }

    let output_filename = arg_handler.get_file_name_from_argv(program_options.output_arg_index);
    write_to_file(output_filename, generated_code);

})();
