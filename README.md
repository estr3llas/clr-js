# clr-js
Rename variables previously renamed by \"obfuscator.io\", that is, transforming "_0x1234" into "v1". This process helps the manual deobfuscation of such obfuscated scripts.

```
CLR-JS
Rename variables previously renamed by "obfuscator.io", that is, transforming "_0x1234" into "v1" for example.
This process helps the manual deobfuscation of such obfuscated scripts.",

Usage:
        node main.js -f [obfuscated.js]

Options:

-f        The .js file
-o        The output file (default is to print on console)
```

Example Input:

```js
(function(_0x277b02,_0x5325bf){var _0x20641d=_0x3767,_0x51a360=_0x277b02();while(!![]){try{var _0x3ac10b=-parseInt(_0x20641d(0x99))/0x1+parseInt(_0x20641d(0x9f))/0x2+-parseInt(_0x20641d(0x9e))/0x3+parseInt(_0x20641d(0x9a))/0x4*(-parseInt(_0x20641d(0x9b))/0x5)+-parseInt(_0x20641d(0x97))/0x6*(parseInt(_0x20641d(0x9c))/0x7)+parseInt(_0x20641d(0x98))/0x8+parseInt(_0x20641d(0x9d))/0x9;if(_0x3ac10b===_0x5325bf)break;else _0x51a360['push'](_0x51a360['shift']());}catch(_0x3e44b9){_0x51a360['push'](_0x51a360['shift']());}}}(_0x58b6,0xb4558));function _0x3767(_0xec6f54,_0x408e06){var _0x58b69d=_0x58b6();return _0x3767=function(_0x376719,_0x2340ee){_0x376719=_0x376719-0x97;var _0x538761=_0x58b69d[_0x376719];return _0x538761;},_0x3767(_0xec6f54,_0x408e06);}function _0x58b6(){var _0x491a30=['80815QSoHto','15176007ZPyFtM','2426961gdseYi','2791948GUYEow','42ahLYiC','1937024VHOUnt','412312QQzcKS','5134252GQVugH','5neWExP'];_0x58b6=function(){return _0x491a30;};return _0x58b6();}function hi(){console['log']('Hello\x20World!');}hi();
```

Example Output:

```js
(function (a0, a1) {
    var v0 = sub_0, v1 = a0();
    while (!![]) {
        try {
            var v2 = -parseInt(v0(153)) / 1 + parseInt(v0(159)) / 2 + -parseInt(v0(158)) / 3 + parseInt(v0(154)) / 4 * (-parseInt(v0(155)) / 5) + -parseInt(v0(151)) / 6 * (parseInt(v0(156)) / 7) + parseInt(v0(152)) / 8 + parseInt(v0(157)) / 9;
            if (v2 === a1)
                break;
            else
                v1['push'](v1['shift']());
        } catch (_0x3e44b9) {
            v1['push'](v1['shift']());
        }
    }
}(sub_1, 738648));
function sub_0(a2, a3) {
    var v3 = sub_1();
    return sub_0 = function (_0x376719, _0x2340ee) {
        _0x376719 = _0x376719 - 151;
        var v4 = v3[_0x376719];
        return v4;
    }, sub_0(a2, a3);
}
function sub_1() {
    var v5 = [
        '80815QSoHto',
        '15176007ZPyFtM',
        '2426961gdseYi',
        '2791948GUYEow',
        '42ahLYiC',
        '1937024VHOUnt',
        '412312QQzcKS',
        '5134252GQVugH',
        '5neWExP'
    ];
    sub_1 = function () {
        return v5;
    };
    return sub_1();
}
function sub_2() {
    console['log']('Hello World!');
}
sub_2();
```
