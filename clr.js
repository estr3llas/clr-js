import { read_file, write_to_file } from './file.js';
import * as name_generator from './generator.js'
import * as arg_handler from './arguments.js'

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import process from 'node:process';
import escodegen from 'escodegen';

const from_raw_to_value = (ast) => {
    walk.full(ast, (node) => {
        if (node.type === 'VariableDeclarator' && node.init?.type === 'Literal') {
            delete node.init.raw;
        }
    })
}

/**
 * Creates a mapping of original identifiers to their new names
 * @param {Object} ast - The (obfuscated) AST to analyze
 * @returns {Map} - A mapping of original (_0x1234) names to new names (v1)
 */
const rename_ast = (ast) => {
    const mapping = new Map();

    walk.full(ast, (node) => {
        switch(node.type) {
            case 'VariableDeclarator': {
                if (node.id.type === 'Identifier' && !mapping.has(node.id.name)) {
                    let declaration_kind = '';
                    walk.ancestor(node, (ancestor) => {
                        if (ancestor.type === 'VariableDeclaration') {
                            declaration_kind = ancestor.kind;
                        }
                    });
        
                    let original_name = node.id.name;
                    let new_name = '';
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

                    node.params
                    ?.filter( p => p.type === 'Identifier' && !mapping.has(p.name))
                    .forEach(param => {
                            let original_param_name = param.name;
                            let new_param_name = name_generator.get_new_arg_name();
                            console.log(`    [i] Parameter ${original_param_name} renamed to: ${new_param_name}\n`);
                            mapping.set(original_param_name, new_param_name);
                        });
                }
                break;
            }
            case 'FunctionExpression': {
                node.params
                ?.filter( p => p.type === 'Identifier' && !mapping.has(p.name))
                .forEach(param => {
                        console.log(`[+] Found FunctionExpression with params: (${node.params.map(p => p.name).join(', ')})`);
                        let original_param_name = param.name;
                        let new_param_name = name_generator.get_new_arg_name();
                        console.log(`    [i] Parameter ${original_param_name} renamed to: ${new_param_name}\n`);
                        mapping.set(original_param_name, new_param_name);
                    });

                };
            break;
            case 'CallExpression': {
                if (node.callee.type === 'FunctionExpression') {

                    node.callee.params
                    ?.filter( p => p.type === 'Identifier' && !mapping.has(p.name))
                    .forEach(param => {
                            let original_name = param.name;
                            let new_name = name_generator.get_new_arg_name();
                            console.log(`[+] Found IIFE parameter: ${param.name} renamed to: ${new_name}\n`);
                            mapping.set(original_name, new_name);
                        });

                    };
                }
                break;
            case 'SequenceExpression': {
                node.expressions?.forEach(expression => {
                    if (expression.type === 'Identifier' && !mapping.has(expression.name)) {
                        let original_name = expression.name;
                        let new_name = name_generator.get_new_arg_name();

                        mapping.set(original_name, new_name);

                        console.log(`[+] Found sequence expression identifier: ${original_name}`);
                        console.log(`    [i] Sequence identifier ${original_name} renamed to: ${new_name}\n`);
                    }
                });
                break;
            }
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
            case 'ImportSpecifier':
            case 'ImportDefaultSpecifier':
            case 'ImportNamespaceSpecifier': 
            if (node.local && node.local.type === 'Identifier') {
                const original_name = node.local.name;
                if (!mapping.has(original_name)) {
                    const new_name = name_generator.get_new_import_name();
                    
                    console.log(`[+] Found import: ${original_name}`);
                    console.log(`    [i] Import ${original_name} renamed to: ${new_name}\n`);
                    mapping.set(original_name, new_name);
                }
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
            case 'ObjectExpression': {
                node.properties?.forEach(property => {
                    if (property.type === 'Property' && 
                        property.key && 
                        property.key.type === 'Identifier' && 
                        !mapping.has(property.key.name)) {
                        
                        let original_name = property.key.name;
                        let new_name = name_generator.get_new_property_id();

                        mapping.set(original_name, new_name);

                        console.log(`[+] Found object property key: ${original_name}`);
                        console.log(`    [i] Property key ${original_name} renamed to: ${new_name}\n`);
                    }
                });
                break;
            }
            case 'MemberExpression': {
                if (node.property?.type === 'Identifier' && !mapping.has(node.property.name)) {
                    let original_name = node.property.name;
                    let new_name = name_generator.get_new_member_name();
                    mapping.set(original_name, new_name);

                    console.log(`[+] Found member property: ${original_name}`);
                    console.log(`    [i] Member property ${original_name} renamed to: ${new_name}\n`);
                }

                let target = node.object;
                while (target && target.type === 'MemberExpression') {
                    target = target.object;
                }

                if (target?.type === 'Identifier' && !mapping.has(target.name)) {
                        let original_name = target.name;
                        let new_name = name_generator.get_new_variable_name();
                        mapping.set(original_name, new_name);

                        console.log(`[+] Found member object: ${original_name}`);
                        console.log(`    [i] Member object ${original_name} renamed to: ${new_name}\n`);
                }
                break;
            }
        }
    });

    return mapping;
}

/**
 * Applies the name mapping to the AST
 * @param {Object} ast - The AST to modify
 * @param {Map} mapping - The name mapping to apply
 * @returns {Object} - The modified (renamed) AST
 */
const apply_mapping = (ast, mapping) => {
    walk.full(ast, (node) => {
        if (node.type === 'Identifier' && mapping.has(node.name)) {
            node.name = mapping.get(node.name);
        }

        if (node.type === 'MemberExpression' &&
            node.property &&
            node.property.type === 'Identifier' &&
            node.computed === false &&
            mapping.has(node.property.name)) {
            node.property.name = mapping.get(node.property.name);
        }

        if (node.type === 'Property' &&
            node.key &&
            node.key.type === 'Identifier' &&
            node.computed === false &&
            mapping.has(node.key.name)) {
            node.key.name = mapping.get(node.key.name);
        }

        if (node.type === 'LabeledStatement' &&
            node.label &&
            mapping.has(node.label.name)) {
            node.label.name = mapping.get(node.label.name);
        }

        if ((node.type === 'ContinueStatement' || node.type === 'BreakStatement') &&
            node.label &&
            mapping.has(node.label.name)) {
            node.label.name = mapping.get(node.label.name);
        }

        if ((node.type === 'ImportSpecifier' ||
             node.type === 'ImportDefaultSpecifier' ||
             node.type === 'ImportNamespaceSpecifier') &&
            node.local &&
            node.local.type === 'Identifier' &&
            mapping.has(node.local.name)) {
            node.local.name = mapping.get(node.local.name);
        }
    });

    return ast;
};

/**
 * Generates code from an AST
 * @param {Object} ast - The AST to generate code from
 * @returns {string} - The generated code
 */
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

// It is not actually ascii art. =)
const show_ascii = () => {
    console.log("          CLR-JS")
    console.log("        ----------\n")
}

const passes = [
    { fn: from_raw_to_value, inputs: ['ast'], output: null },
    { fn: rename_ast, inputs: ['ast'], output: 'mapping' },
    { fn: apply_mapping, inputs: ['ast', 'mapping'], output: null },
    { fn: generate_code, inputs: ['ast'], output: 'code' }
];

(function () {

    let args = arg_handler.read_args();
    if (args.file_arg === false) {
        arg_handler.show_help();
        process.exit(0);
    }

    let obfuscated_file_name = arg_handler.get_val_from_arg(args.file_arg_index)
    let file_buffer = read_file(obfuscated_file_name);

    switch(file_buffer) {
        case 'FILE_NOT_FOUND':
            var errorMessage = `[-] The file ${obfuscated_file_name} was not found.`;
            break;
        case 'OP_NOT_SUPPORTED':
            var errorMessage = `[-] Operation not supported on ${process.platform}.`;
            break;
        case 'FAILED':
            var errorMessage = `[-] Operation failed.`;
            break;
    }

    if (errorMessage) {
        console.log(errorMessage);
        process.exit(0);
    }
    
    show_ascii();

    try {
        const ast = parse(file_buffer, {
            ecmaVersion: args.ecma_args 
                            ? parseInt(arg_handler.get_val_from_arg(args.ecma_arg_index), 10) 
                            : "latest",
            strictMode: !!args.strict_arg,
            sourceType: "module"
        });

        const generated_code = ((ast, passes) => {
            let context = { ast };
            
            for (const pass of passes) {
              const args = pass.inputs.map(input => context[input]);
              const result = pass.fn(...args);
              
              if (pass.output) {
                context[pass.output] = result;
              }
            }
            
            return context.code || context.ast;
        })(ast, passes);

        if (args.output_arg === false) {
            console.log("[+] Renamed Output:");
            console.log(generated_code);
            return;
        }

        const output_filename = arg_handler.get_val_from_arg(args.output_arg_index);
        write_to_file(output_filename, generated_code);
        console.log(`[i] Output file written to: ${output_filename}.`);
    } catch (error) {
        console.error(`[-] Error processing file: ${error.message}`);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }

})();
