var new_var_id = (() => {
    var var_id = 0;
    return function() { return var_id++; };
})();

export const get_new_variable_name = () => {
    return 'v' + new_var_id().toString();
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
