(function (context) {
    var key = 31;
    function splitStr (str) {
        var code = [];
        var num = 0;
        var lengthPro = 0;
        for(var i=0; i< str.length; i = lengthPro){
            num = parseInt(str.substr(lengthPro,1),key);
            code.push(str.substr(1+lengthPro,num));
            lengthPro = lengthPro+num+1;
        }
        return code;
    }
    function pad (val, n) {
        var short0 = n - val.length;
        for(var j=short0; j>0; j--){
            val = '0'+val;
        }
        return val;
    }
    function decodeStr (s) {
        var sub = [];
        var strsound = '';
        var len = 16;
        var code = splitStr(s);

        for(var i=0; i<code.length; i++) {
            var cur = code[i];
            cur = parseInt(cur,key).toString(10);
            if(code.length-1 !==i && cur.length < len){
                var short0 = len - cur.length;
                for(var j=short0; j>0; j--){
                    cur = '0'+cur;
                }
            }
            sub.push(cur);
        }
        s = sub.join('');
        var sound = splitStr(s);
        for(var i=0; i<sound.length; i++) {
            var cur = sound[i];
            strsound += String.fromCharCode(cur);
        }
        return strsound;
    }

    context.decode = function (s) {
        return decodeStr(s);
    }
    context.encode = function (s) {

    }
})(window.Util);
