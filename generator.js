var new_var_id = (() => {
    var var_id = 0;
    return function() { return var_id++; };
})();

export const get_new_variable_name = () => {
    return 'v' + new_var_id().toString();
}

var new_member_id = (() => {
    var member_id = 0;
    return function() { return member_id++; };
})();

export const get_new_member_name = () => {
    return 'm' + new_member_id().toString();
}

var new_property_id = (() => {
    var property_id = 0;
    return function() { return property_id++; };
})();

export const get_new_property_id = () => {
    return 'p' + new_property_id().toString();
}

var new_sub_id = (() => {
    var sub_id = 0;
    return function() { return sub_id++; };
})();

export const get_new_sub_name = () => {
    return 'sub_' + new_sub_id().toString();
}

var new_const_id = (() => {
    var const_id = 0;
    return function() { return const_id++; };
})();

export const get_new_const_name = () => {
    return 'const_' + new_const_id().toString();
}

var new_arg_id = (() => {
    var arg_id = 0;
    return function() { return arg_id++; };
})();

export const get_new_arg_name = () => {
    return 'a' + new_arg_id().toString();
}

var new_label_id = (() => {
    var label_id = 0;
    return function() { return label_id++; };
})();

export const get_new_label_name = () => {
    return 'label_' + new_label_id().toString();
}

var new_import_id = (() => {
    var import_id = 0;
    return function() { return import_id++; };
})();

export const get_new_import_name = () => {
    return 'import_' + new_import_id().toString();
}

var new_catch_clause_id = (() => {
    var catch_clause_id = 0;
    return function() { return catch_clause_id++; };
})();

export const get_new_catch_clause_name = () => {
    return 'catch_' + new_catch_clause_id().toString();
}