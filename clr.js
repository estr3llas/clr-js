import { read_file, write_to_file } from './file.js';
import * as name_generator from './generator.js'
import * as arg_handler from './arguments.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import process from 'node:process';
import escodegen from 'escodegen';

const rename_ast = (ast) => {
    const mapping = new Map();

    walk.full(ast, (node) => {
        switch(node.type) {
            case 'VariableDeclarator': {
                if (node.id.type === 'Identifier' && !mapping.has(node.id.name)) {
                    let original_name = node.id.name;
                    let new_name = '';
        
                    let declaration_kind = '';
                    walk.ancestor(node, (ancestor) => {
                        if (ancestor.type === 'VariableDeclaration') {
                            declaration_kind = ancestor.kind;
                        }
                    });
        
                    switch (declaration_kind) {
                        case 'const':
                            new_name = name_generator.get_new_const_name();
                            break;
                        default:
                            new_name = name_generator.get_new_variable_name();
                    }
        
                    console.log(`[+] Found variable: ${original_name}`);
                    console.log(`    [i] Variable ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);
                }
                break;
            }
            case 'FunctionDeclaration': {
                if (node.id && node.id.type === 'Identifier' && !mapping.has(node.id.name)) {
                    let original_name = node.id.name;
                    let new_name = name_generator.get_new_sub_name();

                    console.log(`[+] Found FunctionDeclaration: ${original_name} (${node.params.map(p => p.name).join(', ')})`);
                    console.log(`    [i] Function ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);

                    node.params.forEach(param => {
                        if (param.type === 'Identifier' && !mapping.has(param.name)) {
                            let original_param_name = param.name;
                            let new_param_name = name_generator.get_new_arg_name();
                            console.log(`    [i] Parameter ${original_param_name} renamed to: ${new_param_name}\n`);
                            mapping.set(original_param_name, new_param_name);
                        }
                    });
                }
                break;
            }
            case 'FunctionExpression': {
                node.params.forEach(param => {
                    if (!mapping.has(param.name) && param.type === 'Identifier'){
                        console.log(`[+] Found FunctionExpression with params: (${node.params.map(p => p.name).join(', ')})`);
                        let original_param_name = param.name;
                        let new_param_name = name_generator.get_new_arg_name();
                        console.log(`    [i] Parameter ${original_param_name} renamed to: ${new_param_name}\n`);
                        mapping.set(original_param_name, new_param_name);
                    }
                });
                break;
            }
            case 'CallExpression':
                if (node.callee.type === 'FunctionExpression') {
                    node.callee.params.forEach(param => {
                        if (param.type === 'Identifier' && !mapping.has(param.name)) {
                            const new_name = name_generator.get_new_arg_name();
                            console.log(`[+] Found IIFE parameter: ${param.name} renamed to: ${new_name}\n`);
                            mapping.set(param.name, new_name);
                        }
                    });
                }
                break;
            case 'LabeledStatement': {
                if (node.label.type === 'Identifier' && !mapping.has(node.label.name)) {
                    let original_name = node.label.name;
                    let new_name = name_generator.get_new_label_name();
        
                    console.log(`[+] Found label: ${original_name}`);
                    console.log(`    [i] Label ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);
                }
                break;
            }
            case 'ImportDefaultSpecifier':
            case 'ImportNamespaceSpecifier': 
                if(!mapping.has(node.local.name)){
                    let original_name = node.local.name;
                    let new_name = name_generator.get_new_import_name();
        
                    console.log(`[+] Found import: ${original_name}`);
                    console.log(`    [i] Import ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);
                }
                break;     
            case 'TryStatement':
                if(node.handler.type === 'CatchClause' && !mapping.has(node.handler.param.name)) {
                    let original_name = node.handler.param.name;
                    let new_name = name_generator.get_new_catch_clause_name();
        
                    console.log(`[+] Found Catch clause: ${original_name}`);
                    console.log(`    [i] Catch clause ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);
                }
                break;
        }
    });

    return mapping;
}

const apply_mapping = (ast, mapping) => {
    walk.full(ast, (node) => {
        if (node.type === 'Identifier' && mapping.has(node.name)) {
            node.name = mapping.get(node.name);
        }
    });

    return ast;
}

const generate_code = (ast) => {
    return escodegen.generate(ast, {
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

}

// It is not ascii.
const show_ascii = () => {
    console.log("          CLR-JS")
    console.log("        ----------\n")
}

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
    
    show_ascii();

    const ast = parse(
        file_buffer, 
        {   
            ecmaVersion: "latest",
            sourceType: "module"
        }
    );

    const mapping = rename_ast(ast);
    
    apply_mapping(ast, mapping);

    const generated_code = generate_code(ast);

    if(program_options.output_arg === false) {
        console.log("[+] Renamed Output:");
        console.log(generated_code);
        process.exit(0);
    }

    let output_filename = arg_handler.get_file_name_from_argv(program_options.output_arg_index);
    write_to_file(output_filename, generated_code);
    console.log(`[i] Output file written to: ${output_filename}.`);

})();
