(function () {
    var jQuery = window.jQuery;
    var $ = window.jQuery;
    var ROOT_PATH = window.ROOT_PATH || './';

    var toString = Object.prototype.toString;

    function version () {
        return "Dt 1.0.0";
    }

    log._filter = 'warning,error';
    function log (type, formater, para) {
        if (-1 === log._filter.indexOf(type)) {
            return;
        }

        if (isString(para)) {
            para = [para];
        }

        var s = formatStr(formater, para);

        var oDate = new Date();
        var sLog = formatStr('{{h}}:{{m}}:{{s}}.{{ms}}-{{log}}', {
            h: oDate.getHours(),
            m: oDate.getMinutes(),
            s: oDate.getSeconds(),
            ms: oDate.getMilliseconds(),
            log: s
        });

        console.log(sLog);
    }

    function capitalFirst(str){return str.charAt(0).toUpperCase()+str.substring(1)}
    function isUndefined(value){return typeof value === 'undefined';}
    function isDefined(value){return typeof value !== 'undefined';}
    function isString(value){return typeof value === 'string';}
    function isNumber(value){return typeof value === 'number';}
    function isDate(value){return toString.call(value) === '[object Date]';}
    function isArray(value){return toString.call(value) === '[object Array]';}
    function isFunction(value){return typeof value === 'function';}
    function isRegExp(value){return toString.call(value) === '[object RegExp]';}
    function isBoolean(value){return typeof value === 'boolean';}
    function isObject(value){return value != null && typeof value === 'object';}
    function isEmptyObject(obj) {
        for(var key in obj) {
            if ('' !== obj[key]) {
                return false;
            }
        };
        return true;
    }
    function isElement(node){
        return !!(node &&
        (node.nodeName  // we are a direct element
        || (node.on && node.find)));  // we have an on and find method part of jQuery API
    }
    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }
    function isJsonValue (val) {
        if (isString(val) || isNumber(val) || isBoolean(val)) {
            return true;
        }

        return false;
    }
    function getUniqueId (prefix) {
        prefix = prefix || "dtscreen";

        if (!getUniqueId.ids[prefix]) {
            getUniqueId.ids[prefix] = 0;
        }
        getUniqueId.ids[prefix]++;
        return prefix + '_' + getUniqueId.ids[prefix];
    }
    getUniqueId.ids = {};

    function isArrayLike(obj) {
        if (obj == null || isWindow(obj)) {
            return false;
        }

        var length = obj.length;

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return isString(obj) || isArray(obj) || length === 0 ||
            typeof length === 'number' && length > 0 && (length - 1) in obj;
    }

    function animateArrChanger (from, to, nTimes) {
        var aFrom = from.slice(0);
        var aTo = to.slice(0);
        var aStep = [];
        var nCurTimes = nTimes;

        for (var i = 0; i < aFrom.length; i++) {
            aStep[i] = (aTo[i] - aFrom[i]) / nTimes;
        }

        function isEnd () {
            var bEnd = (0 === nCurTimes);

            return bEnd;
        }

        this.increase = function (aVal) {
            if (isEnd()) {
                return false;
            }

            for (var j = 0; j < aFrom.length; j++) {
                aVal[j] = aVal[j] + aStep[j];
            }

            nCurTimes--;
            if (0 === nCurTimes) {
                aVal = aTo;
            }

            return aVal;
        };
    }

    function animateIntChanger (from, to, nTimes) {
        var nFrom = from;
        var nTo = to;
        var nStep = (nTo - nFrom) / nTimes;
        var nCurStep = 0;

        function getStep () {
            return nStep;
        }

        function isEnd (nCurVal) {
            var bEnd = (nCurVal === nTo);
            return bEnd;
        }

        this.increase = function (nVal) {
            if (isEnd(nVal)) {
                return false;
            }

            nCurStep++;
            nVal += getStep(nCurStep);

            if ((nFrom <= nTo) && (nVal >= nTo)) {
                nVal = nTo;
            } else if ((nFrom > nTo) && (nVal <= nTo)) {
                nVal = nTo;
            }

            return nVal;
        };
    }

    function animate (nFrom, nTo, opt, callback, oCbPara) {
        var SpeedMap = {'slow': 50, 'normal': 20, 'fast': 10};
        var TypeMap = {'int': animateIntChanger, 'arr': animateArrChanger};
        var oDefOpt = {
            speed: 'normal',
            increase: increaseVal,
            type: 'int',
            onEnd: null
        };

        // 没有传opt参数时，opt后面的全部参数都后移
        if (window.Util.isFunction(opt)) {
            oCbPara = callback;
            callback = opt;
            opt = {};
        }

        // 合并opt
        opt = window.Util.extend(oDefOpt, opt);

        var oChanger;
        var nCurVal = nFrom;
        var nTimes = SpeedMap[opt.speed] || SpeedMap['normal'];

        function increaseVal (nVal) {
            if (!oChanger) {
                oChanger = new TypeMap[opt.type](nFrom, nTo, nTimes);
            }
            return oChanger.increase(nVal);
        }

        function _do () {
            callback(nCurVal, oCbPara);

            nCurVal = opt.increase(nCurVal);
            if (false === nCurVal) {
                // end
                opt.onEnd && opt.onEnd(oCbPara);
                return;
            }

            setTimeout(_do, 10);
        }

        _do();
    }

    function forEach(obj, iterator, context) {
        var key;
        if (obj) {
            if (isFunction(obj)) {
                for (key in obj) {
                    // Need to check if hasOwnProperty exists,
                    // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context);
            } else if (isArrayLike(obj)) {
                for (key = 0; key < obj.length; key++)
                    iterator.call(context, obj[key], key);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key);
                    }
                }
            }
        }
        return obj;
    }

    // formater暂时只支持 "HH:mm:ss"
    function formatDate (date, formater) {
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();

        var paddNum = function (val, size) {
            var num = '' + val;
            size = size || 2;
            while(num.length < size) num = '0' + num;
            return num;
        };

        return paddNum(hh) + ':' + paddNum(mm) + ':' + paddNum(ss);
    }

    function extend () {
        var nParaFrom = 1;
        var nLevel = 1;
        var dst = arguments[0];

        if (isNumber(dst)) {
            nLevel = dst;
            dst = arguments[1];
            nParaFrom = 2;
        }

        dst = dst || {};
        for (var i = nParaFrom; i < arguments.length; i++) {
            var obj = arguments[i];
            _extend(nLevel, dst, obj);
        };

        function _extend (nLevel, dst, obj) {
            // 
            if (0 === nLevel) {
                return;
            }

            forEach(obj, function (value, key) {
                if (isObject(value) && (nLevel>1)) {
                    var defVal = isArray(value) ? [] : {};
                    dst[key] = dst[key] || defVal;
                    _extend(nLevel-1, dst[key], value);
                } else {
                    dst[key] = value;
                }
            });
        }

        return dst;
    }

    function extendAttrs (dst, obj, aAttr) {

        for (var i = 0; i < aAttr.length; i++) {
            var val = obj[aAttr[i]];
            if (!isUndefined(val)) {
                dst[aAttr[i]] = val;
            }
        }

        return dst;
    }

    function getRandomVal (min, max) {
        return Math.round(Math.random() * (max-min) + min);
    }

    function getResourcePath () {
        return ROOT_PATH + 'resource/';
    }

    function getJsonByName (sName, cb) {
        if ('file:' === window.location.protocol) {
            cb({});
            return;
        }

        var url;
        if ('../' === sName.substring(0, 3)) {
            url = '/manage/' + sName.substring(3);  // /manage/control/xxx
        } else {
            url = ROOT_PATH + 'resource/infos/' + sName + '?v=' + (''+Math.random()).substring(2);
        }

        $.getJSON(url, function (data) {
            cb(data);
        });
    }

    function getFormPara (oForm) {
        var oPara = {};
        for (var i=0; i<oForm.length; i++) {
            var oEle = oForm[i];
            var sName = oEle.name;
            if ('' === sName) {
                continue;
            }

            var aName = sName.split('.');
            var oData = oPara;
            sName = aName[0];
            for (var j = 0; j < aName.length - 1; j++) {
                oData[sName] = oData[sName] || {};
                oData = oData[sName];
                sName = aName[j + 1];
            }

            var val = oEle.value;
            if (('number' === oEle.type) || ('range' === oEle.type)) {
                val = parseInt(val, 10);
            }
            oData[sName] = val;
        }

        return oPara;
    }
    function setFormPara (oForm, oPara) {
        for (var i=0; i<oForm.length; i++) {
            var oEle = oForm[i];
            var sName = oEle.name;
            var aName = sName.split('.');

            var val = oPara;
            for (var j = 0; j < aName.length; j++) {
                sName = aName[j];
                val = val[sName];
                if (undefined === val) {
                    break;
                }
            }
            if (undefined !== val) {
                oEle.value = val;
            }
        }
    }

    function updateHtml (div, data) {
        for (var id in data) {
            var $ele = $('#' + id, div);
            var widget = $ele.data("widget");
            var val = data[id];

            if (isFunction(val)) {
                val($ele, data);
            } else if (widget) {
                widget.refresh(val);
            } else {
                $ele.html(data[id]);
            }
        }
    }

    function toText (sHtml) {
        sHtml = sHtml + '';
        return sHtml
            .replace(/&/gi, '&amp;')
            .replace(/</gi, '&lt;')
            .replace(/>/gi, '&rt;');
    }

    function formatStr (sFormater, paras) {
        var formatByArr = function (s, aPara) {
            s = s.replace(/\{\{0\}\}/g, (''+aPara[0] || '-'))
                .replace(/\{\{1\}\}/g, (''+aPara[1] || '-'))
                .replace(/\{\{2\}\}/g, (''+aPara[2] || '-'))
            ;
            return s;
        };
        var formatByObj = function (s, oParas) {
            for (var key in oParas) {
                s = s.replace(new RegExp('\{\{'+key+'\}\}','g'), oParas[key]);
            }
            return s;
        }

        var pf = (isArray(paras)) ? formatByArr : formatByObj;
        return pf(sFormater, paras);
    }

    function formatCss (oParas) {
        var aStr = [];
        for (var key in oParas) {
            var val = oParas[key];
            var sFix = isNumber(val) ? 'px' : '';
            aStr.push(key + ':' + oParas[key] + sFix);
        }
        return aStr.join(';');
    }

    function formatAttr (oParas) {
        var aStr = [];
        for (var key in oParas) {
            var val = oParas[key];
            aStr.push(key + '="' + oParas[key] + '"');
        }
        return aStr.join(' ');
    }

    function formatJson(oJson) {
        var nIndent = 0;

        var indentStr = function (str) {
            var sNewLine = '';
            var sSpace = '                                                   ';
            var sFirstChar = str.charAt(0);

            if ('\r\n' == str.substring(0,2)) {
                // 已经换过行和缩进了，直接返回原字符串
                return str;
            }

            if ((0 < nIndent) || ('}' === sFirstChar) || (']' === sFirstChar)) {
                sNewLine = '\r\n';
            }

            sSpace = sSpace.substring(0, 4 * nIndent);

            return sNewLine + sSpace + str;
        };

        var addComma = function (val) {
            return isNumber(val) ? val : '"' + val + '"';
        };
        var getJsonPare = function (key, val) {
            var str = '';

            if (isUndefined(val)) {
                val = key;
                str = addComma(val);
            } else {
                str = addComma(key) + ':' + addComma(val);
            }

            return str;
        };

        var formatArrInline = function (key, arr) {
            var aStr = [];

            var sStart = ('' === key) ? '[' : ('"' + key + '": [');
            var sEnd = ']';

            for (var i = 0; i < arr.length; i++) {
                var val = getJsonPare(arr[i]);
                aStr.push(val);
            }

            return sStart + aStr.join(', ') + sEnd;
        };
        var formatArr = function (key, arr) {
            var aStr = [];

            if (true === checkArrInline(arr)) {
                return formatArrInline(key, arr);
            }

            var sStart = ('' === key) ? '[' : ('"' + key + '": [');
            var sEnd = indentStr(']');
            sStart = indentStr(sStart);

            for (var i = 0; i < arr.length; i++) {
                var val = arr[i];
                if (isArray(val)) {
                    val = formatArr('', val);
                    aStr.push(val);
                } else if (isObject(val)) {
                    nIndent++;
                    val = formatObj('', val);
                    aStr.push(val);
                    nIndent--;
                } else if (isJsonValue(val)) {
                    val = getJsonPare(val);
                    aStr.push(val);
                }
            }
            aStr.push();

            return sStart + aStr.join(', ') + sEnd;
        };

        // 数组中对象类型元素时在同一行内显示
        var checkArrInline = function (arr) {
            var bInline = true;

            for (var i = 0; i < arr.length; i++) {
                if (isObject(arr[i])) {
                    bInline = false;
                    break;
                }
            }

            return bInline;
        };

        // 最后一级没有对象类型的属性时在同一行内显示
        var checkObjInline = function (obj) {
            var bInline = true;
            for (var key in obj) {
                if (isObject(obj[key])) {
                    bInline = false;
                    break;
                }
            }

            return bInline;
        };
        var formatObjInline = function (key, obj) {
            var aStr = [];

            var sStart = ('' === key) ? '{' : ('"' + key + '": {');
            var sEnd = '}';
            sStart = indentStr(sStart);

            nIndent++;
            for (var key in obj) {
                var val = obj[key];
                if (isJsonValue(val)) {
                    val = getJsonPare(key, obj[key]);
                    aStr.push(val);
                }
            }
            nIndent--;

            return sStart + aStr.join(', ') + sEnd;
        };
        var formatObj = function (key, obj) {
            var aStr = [];

            if (true === checkObjInline(obj)) {
                return formatObjInline(key, obj);
            }

            var sStart = ('' === key) ? '{' : ('"' + key + '": {');
            var sEnd = indentStr('}');
            sStart = indentStr(sStart);

            nIndent++;
            for (var key in obj) {
                var val = formatValue(key, obj[key]);
                if (isUndefined(val)) {
                    continue;
                }
                aStr.push(indentStr(val));
            }
            nIndent--;

            return sStart + aStr.join(', ') + sEnd;
        };

        var formatValue = function (key, val) {
            var str;
            if (isArray(val)) {
                str = formatArr(key, val);
            } else if (isObject(val)) {
                str = formatObj(key, val);
            } else if (isJsonValue(val)) {
                str = getJsonPare(key, val);
            }

            return str;
        }

        return formatValue('', oJson)

    }

    function getPercentText (val, max) {
        var sText = '';

        if (0 === val) {
            return '0%';
        }

        var nPercent = 100 * val / max;
        if (0.1 > nPercent) {
            nPercent = '<0.1';
        }
        else if (2 > nPercent) {
            nPercent = nPercent.toFixed(1);
        } else {
            nPercent = nPercent.toFixed(0);
        }
        sText = nPercent + "%";

        return sText;
    }

    function getComments (pf) {
        var sFunc = pf.toString();
        var nStart = sFunc.indexOf('/*');
        var nEnd = sFunc.indexOf('*/');
        var sRet = '';

        // sRet = sFunc.replace(/\/\*(\s|\S)*\*\//,"a-$1-b") /* 获取注释中的内容 */
        if (0 < nStart && nEnd > (nStart + 2)) {
            sRet = sFunc.substring(nStart + 2, nEnd);
        }
        return sRet;
    }

    function getFnString (pf) {
        var str;
        var ret = pf();

        if (undefined === ret) {
            str = getComments(pf);
        } else if (isArray(ret)) {
            str = ret.join('');
        } else if (isString(ret)) {
            str = ret;
        } else {
            str = ret.toString();
        }

        return str;
    }

    // _ScriptCach元素的结构：{success:[success], error:[error], status:'loading'}
    // status: loading, success, error
    var _ScriptCach = {};
    function loadScript (url, success, error) {
        var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        var script;
        var options;
        var hTimer = null;

        if ('object' === typeof url) {
            options = url;
            url = undefined;
        }
        options = options || {};
        url = url || options.url;

        if (_ScriptCach[url]) {
            if ('success' === _ScriptCach[url].status) {
                setTimeout(function () {success && success();}, 10);
            } else if ('error' === _ScriptCach[url].status) {
                setTimeout(function () {error && error();}, 10);
            } // else: loading

            // 保存本次的处理函数
            _ScriptCach[url].success.push(success);
            _ScriptCach[url].error.push(error);

            return;
        }

        var oCach = _ScriptCach[url] = {success:[success], error:[error], status:'loading'};
        script = document.createElement('script');
        script.async = true;
        script.type = 'text/javascript';

        if (options.charset) {
            script.charset = options.charset;
        }
        if (false === options.cache) {
            url = url + (/\?/.test(url) ? '&' : '?') + '_=' + (new Date()).getTime();
        }

        try {
            script.src = url;
            head.appendChild(script);

            if (document.addEventListener) {
                script.addEventListener('load', callback, false);
            } else {
                script.onreadystatechange = function () {
                    if (/loaded|complete/.test(script.readyState)) {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            }

            // 一个js文件在3秒钟之内还没有取到，认为是错误
            hTimer = setTimeout(function () {
                hTimer = null;
                callback('error');
            }, 3000);
        } catch (e) {
            callback('error');
        }

        function callback (para) {
            if ('loading' !== oCach.status) {
                // 已经执行过了
                return;
            }

            if ('error' === para) {
                doCallback('error');
            } else {
                doCallback('success');
            }

            if (hTimer) {
                clearTimeout(hTimer);
                hTimer = null;
            }
        }

        function doCallback (sType) {
            var aCallback = oCach[sType];
            oCach.status = sType;
            for (var i = 0; i < aCallback.length; i++) {
                aCallback[i] && aCallback[i]();
            }
        }
    }

    function Http () {
        function httpRequest (url, oData/*=null*/, sMethod/*='GET'*/) {
            var req = $.ajax({
                url: url,
                data: oData||{},
                type: sMethod || 'GET',
                dataType: 'json',
                success: function (data) {
                    console.log('success', data)
                },
                error: function (a, b) {
                    console.log('error', b);
                }
            });

            // req.
            //  complete, success, error, then, abort
            return req;
        }

        function httpGet (url, oData/*=null*/) {
            return httpRequest(url, oData, 'GET');
        }

        function httpPost (url, oData/*=null*/) {
            return httpRequest(url, oData, 'POST');
        }

        function httpWhen (aUrl) {
            var aPara = [];
            for (var i = 0; i < aUrl.length; i++) {
                aPara.push(httpRequest(aUrl[i]));
            }

            return $.when.apply(window, aPara);
        }

        return {
            get: httpGet,
            post: httpPost,
            when: httpWhen
        }
    }

    window.Util = {};

    extend(window.Util, {
        'extend': extend,
        'extendAttrs': extendAttrs,
        'log': log,
        'element': jQuery,
        'forEach': forEach,
        'capitalFirst': capitalFirst,
        'isUndefined': isUndefined,
        'isDefined': isDefined,
        'isString': isString,
        'isFunction': isFunction,
        'isObject': isObject,
        'isNumber': isNumber,
        'isEmptyObject': isEmptyObject,
        'isElement': isElement,
        'isArray': isArray,
        'isDate': isDate,
        'getRandomVal': getRandomVal,
        'getUniqueId': getUniqueId,
        'getFormPara': getFormPara,
        'setFormPara': setFormPara,
        'animate': animate,
        'formatDate': formatDate,
        'formatStr': formatStr,
        'formatCss': formatCss,
        'formatAttr': formatAttr,
        'formatJson': formatJson,
        'loadScript': loadScript,
        'getResourcePath': getResourcePath,
        'getJsonByName': getJsonByName,
        'updateHtml': updateHtml,
        'toText': toText,
        'getPercentText': getPercentText,
        'getFnString': getFnString,
        'version': version
    });
})();
