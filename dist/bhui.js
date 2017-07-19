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

(function (window) {
    var LocalFile = {
        save: function (sFileName, sText, cb) {
            DtUI.Message.alert('保存功能需要通过HTTP访问', cb);
            return false;
        },
        load: function (sFileName) {
            var sText = '';
            return sText;
        }
    };

    var RemoteFile = {
        save: function (sFileName, sText) {
            var sFormId = Util.getUniqueId('form');
            var sTemplate = '<form action="/saveto/{{0}}" target="_blank" method="post"><textarea name="content">{{1}}</textarea></form>';
            var sForm = Util.formatStr(sTemplate, [sFileName, sText]);
            var form = $(sForm).attr('id', sFormId).appendTo('body').submit();
            setTimeout(function () {
                form.remove();
            }, 2000);

            return true;
        },
        load: function (sFileName) {
            var sText = '';
            return sText;
        }
    }

    var FileObject = ('file:' === window.location.protocol) ? LocalFile : RemoteFile;

    var DtData = {
        save: function (sFileName, sText, cb) {
            return true; //FileObject.save(sFileName, sText, cb);
        },
        load: function (sFileName) {
            return true; //FileObject.load(sFileName);
        }
    }

    window.DtData = DtData;
})(window);

window.DtUI = {};

(function (window) {
    function addButtons (dlg, aButton) {
        for (var i=0; i<aButton.length; i++) {
            var sBtnName = aButton[i];
            $('<button></button>').text(sBtnName).addClass('btn btn-'+sBtnName).attr('action', sBtnName).appendTo(dlg);
        }
    }
    function showDialog (opt) {
        opt = Util.extend({
            title: 'Dialog',
            width: 900,
            height: 600,
            emptyClick: true, // 点击对话框外面时是否关闭对话框
            buttons: 'OK|Cancel',
            onInit: null,
            onClosed: null
        }, opt);

        var nMarginTop = ($(document).height() - opt.height) / 2;
        var oDlg = $('<div class="dialog"></div>')
            .width(opt.width).height(opt.height).css({'margin-top': nMarginTop})
            .on('click', function (e) {
                oDlg.trigger('dlg.click');
                e.stopPropagation();
                e.stopImmediatePropagation();
            })
            .on('click','button', function(e){
                var sAction = $(this).attr('action');
                var pfAction = opt['on'+sAction];
                var bClose = true;
                if (pfAction) {
                    bClose = pfAction.apply(this);
                }
                if (true === bClose) {
                    closeDlg();
                }
            })

        var oDlgBg = $('<div class="full-screen"></div>');
        if (opt.emptyClick) {
            oDlgBg.on('click', closeDlg);
        }

        var oOverlap = $('<div class="overlap"></div>');
        var oDlgTitle = $('<div class="dlg-title"></div>');
        var oDlgBody = $('<div class="dlg-body"></div>');
        var oDlgFooter = $('<div class="dlg-footer"><div class="action"></div></div>');

        var oDlgAction = oDlgFooter.find('.action');
        addButtons(oDlgAction, opt.buttons.split('|'));

        oDlgTitle.html(opt.title);
        oDlgBody.html(opt.template);

        oDlg.append(oDlgTitle).append(oDlgBody).append(oDlgFooter);
        oDlgBg.append(oDlg);
        $('body').append(oOverlap).append(oDlgBg);
        oDlgBody.outerHeight(oDlg.height()-oDlgTitle.outerHeight()-oDlgFooter.outerHeight());

        // 执行模块的初始化
        opt.onInit && opt.onInit();

        function closeDlg () {
            oDlgBg.remove();
            oOverlap.remove();
            if (opt.onClosed) {
                opt.onClosed(e);
            }
        }

        return {
            getEle: function (sSelector) {
                return $(sSelector, oDlg);
            },
            close: closeDlg
        }
    }

    window.DtUI.showDialog = showDialog;
})(window);

(function (window) {
    function InputRange (input, opt) {
        opt = Util.extend({
            title: 'Dialog',
            width: 900,
            height: 600,
            button: 'OK|Cancel',
            onInit: null,
            onOK: null,
            onCancel: null,
            onClosed: null
        }, opt);

        var tip = $('<span></span>');

        $(input).each(function(i, ele){
            var tip = $('<span></span>');
            $(ele).after(tip).change(function (e) {
                var val = this.value;
                if (opt.processData) {
                    val = opt.processData(val);
                } else {
                    val = processData(this);
                }
                tip.text (val);
            }).change();
        });

        function processData (input) {
            var val = input.value;
            var interval = input.getAttribute('interval') || 1;
            return val * interval;
        }
    }

    window.DtUI.InputRange = InputRange;
})(window);

(function (window) {
    var cfg = window.Config || {};
    var TimeOpt = {
        'info': 2000,
        'success': 2000,
        'warning': 3000,
        'error': 5000,
        'wait': 999999
    };
    var PrivateMessage = {
        timer: false,
        position: cfg.MSG_POS || "center", 
        getContainer: function () {
            var div = $('#_message_div');
            if (div.length === 0) {
                div = $('<div id="_message_div"></div>').appendTo('body');
            }
            return div;
        },
        getClass: function(type) {
            var css = this.position + ' message-container';
            if (type) {
                css += ' message-'+type;
            }
            return css;
        },
        dlg: function (opt) {
            opt = Util.extend({
                emptyClick: false,
                width: 900,
                height: 200
            }, opt);
            return window.DtUI.showDialog(opt);
        },
        hide: function(time) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = false;
            }

            var _hide = function () {
                PrivateMessage.getContainer()
                    .hide()
                    .empty()
                    .attr('class', PrivateMessage.getClass());
            };

            if (!time) {
                _hide();
                return ;
            }

            this.timer = setTimeout (function () {
                PrivateMessage.timer = false;
                _hide();
            }, time);
        },
        show: function(type, msg) {
            var time = TimeOpt[type] || 2000;
            var div = this.getContainer();
            div
                .html(msg)
                .attr('class', this.getClass(type))
                .show();
            this.hide(time);
        }
    };

    var Message = {
        cfg: function(para) {
            para = para||{}
            if (para.position) {
                var pos = {
                    'left-top': "left-top",     // 左上
                    'top-left': "left-top",
                    'top-center': "top-center", // 中上
                    'center-top': "top-center",
                    'top-right': "top-right",   // 右上
                    'right-top': "top-right",
                    'center-right': "right-center", // 右中
                    'right-center': "right-center",
                    'bottom-right': "right-bottom", // 右下
                    'right-bottom': "right-bottom",
                    'bottom-center': "bottom-center",// 下中
                    'center-bottom': "bottom-center",
                    'left-bottom': "left-bottom",   // 左下
                    'bottom-left': "left-bottom",
                    'left-center': "left-center",   // 左中
                    'center-left': "left-center",
                    'center': "center"              // 中
                };
                pos[para.position] && (PrivateMessage.position = pos[para.position]);
            }
        },
        alert: function (msg, onOK) {
            PrivateMessage.dlg({
                title: '提示信息',
                template: msg,
                buttons: 'OK',
                onOK: function () {
                    onOK && onOK();
                    return true;
                }
            });
        },
        confirm: function (msg, onOK) {
            PrivateMessage.dlg({
                title: '确认信息',
                template: msg,
                buttons: 'OK|Cancel',
                onOK: function () {
                    onOK && onOK();
                    return true;
                }
            });
        },
        input: function (opt, onOK) {
            opt = Util.extend({multiple: false, val:'', description:''}, opt);
            var sHeight = opt.description ? '75%' : '98%';
            var sHtml = opt.multiple
                ? '<textarea name="userValue" style="width:100%; height:'+sHeight+';"></textarea>'
                : '<input name="userValue" style="width:100%">';

            var oDlgOpt = {
                title: opt.title || '请输入信息',
                template: opt.description + sHtml,
                buttons: 'OK|Cancel',
                onOK: function () {
                    var bClose = true;
                    if (onOK) {
                        var val = dlg.getEle('[name=userValue]').val();
                        bClose = (true===onOK(val));
                    }
                    return bClose;
                }
            };
            if (opt.multiple) {
                oDlgOpt.height = 600;
            }
            var dlg = PrivateMessage.dlg(oDlgOpt);

            dlg.getEle('[name=userValue]').val(opt.val);
            dlg.getEle('textarea').height
        },
        info: function (msg) {
            PrivateMessage.show('info', msg);
        },
        success: function (msg) {
            PrivateMessage.show('success', msg);
        },
        warning: function (msg) {
            PrivateMessage.show('warning', msg);
        },
        error: function (msg) {
            PrivateMessage.show('error', msg);
        },
        wait: function(msg, time) {
            var timer;
            PrivateMessage.show('wait', msg);
            if (time > 0) {
                timer = setTimeout(function() {
                    PrivateMessage.hide();
                }, time);
            }
            return {close: function(){PrivateMessage.hide()}}
        },
        pop: function (type, msg) {
            PrivateMessage.show(type, msg);
        }
    }

    window.DtUI.Message = Message;
})(window);

(function (window) {
/*
http://www.lampweb.org/jquerymobile/16/55.html
<div class="selectview">
    <a class="list-item">
        <img class="icon" src="images/album-bb.jpg" />
        <h3>Broken Bells</h3>
        <div>Broken Bells</div>
    </a>
    <a class="list-item">
        <img class="icon" src="images/album-hc.jpg" />
        <h3>Warning</h3>
        <div>Hot Chip</div>
    </a>
</ul> */
    var ViewTemplate = '<div class="SelectView"><div class="select-value"><span class="value">请选择</span><div class="select-arrow"></div></div><div class="drop-list"></div></div>';
    var ItemTemplate = '<a class="list-item" value="{{value}}"><img class="icon" src="{{icon}}"><h3>{{header}}</h3><div>{{description}}</div></a>';
    var DefaultOpt = {
        'height': 300,
        'multiple': true,
        'data': [], // [{value: '', icon: '', header: '', description: ''}, ...]
        'template': ItemTemplate,
        'placeholder': '请选择',
        'filter': function (data) { return data; },
        'onChange': null
    };

    function appendStr (arr, sFormater, paras) {
        arr.push(Util.formatStr(sFormater, paras));
    }

    // 如果是指定要显示出来，则显示下拉列表
    // 如果是永远显示（droplistshow=true），则显示下拉列表
    // 其他情况是关闭下拉列表
    function showDropList(bShow, selectView) {
        if (true === bShow) {
            showDropList(false);
        }

        selectView = selectView || $('.SelectView');
        Util.forEach(selectView, function(view) {
            var bVisble = ('true' === $(view).attr('droplistshow'));
            if (bShow || bVisble) {
                $('.drop-list', view).show();
            } else {
                $('.drop-list', view).hide();
            }
        });
    }

    $('body').click(function () {
        showDropList(false);
    }).on('dlg.click', function (e) {
        showDropList(false);
    });

    function SelectView (oSelect, oListViewOpt) {
        var selectView;
        var oDataCach = {};
        oListViewOpt = Util.extend({}, DefaultOpt, oListViewOpt);

        function createHtml (data) {
            var aHtml = [];

            function create (data) {
                data = data || [];
                Util.forEach(data, function (value, key) {
                    if (Util.isArray(value)) {
                        if (value.length > 0) {
                            aHtml.push('<div class="group">');
                            aHtml.push('<div class="sub-title">'+key+'</div><div class="item-list">');
                            create(value);
                            aHtml.push('</div></div>');
                        }
                    } else {
                        var oData = oListViewOpt.filter(value);
                        if (Util.isUndefined(oData.value)) {
                            // 数据中必须要有value属性
                            return;
                        }

                        aHtml.push(Util.formatStr(oListViewOpt.template, oData));
                        oDataCach[oData.value] = oData;
                    }
                });
            }

            create(data);

            return aHtml.join('');
        }

        function onDropListShow (e) {
            e.stopPropagation();
            showDropList(true);
        }

        function create () {
            var sClass = oSelect.className;
            selectView = $(ViewTemplate);
            selectView.addClass(sClass).width(oListViewOpt.width || $(oSelect).width())
                .find('.drop-list').height(oListViewOpt.height);
            $(oSelect).after(selectView).hide();

            if (true === oListViewOpt.multiple) {
                selectView.attr('droplistshow', 'true');
                $('.select-value', selectView).hide();
                showDropList(true, selectView);
            } else {
                showDropList(false, selectView);
                $('.select-value', selectView)
                    .show()
                    .click(function (e){
                        e.stopPropagation();
                        showDropList(true, selectView);
                    });
            }

            selectView.on('click', '.drop-list a.list-item', function (e) {
                selectItem(this);
            });

            selectView.on('mouseenter', '.drop-list a.list-item', function (e) {
                showTip(this);
            });

            selectView.on('mouseleave', '.drop-list a.list-item', function (e) {
                removeTip(this);
            });

            syncSelectToView();
        }

        // 更新标准下拉框中的列表
        function syncSelectToView () {
            //
        }

        // 更新到下标准拉框中
        function updateSelect (aData) {
            var aOption = [];

            Util.forEach(oDataCach, function (value, key) {
                var sFormater = '<option value="{{value}}">{{value}}'
                aOption.push(Util.formatStr(sFormater, {value:key}));
            });

            $(oSelect).html(aOption.join(''));
        }

        function setData (aData) {
            if (!aData) {
                return;
            }

            var sHtml = createHtml(aData);
            selectView.find('.drop-list').html(sHtml);

            // update to SELECT
            updateSelect(aData);

            if (-1 !== oSelect.selectedIndex) {
                var oItem = $('.list-item', selectView).eq(oSelect.selectedIndex);
                selectItem(oItem);
                // $body.animate({scrollTop: $('#header').offset().top}, 1000);
            }
        }

        function selectItem (oItem) {
            oItem = $(oItem);

            // select the item
            $(oItem).parent().find('.hightlight').removeClass('hightlight');
            $(oItem).addClass('hightlight');

            var val = oItem.attr('value');
            var oData = oDataCach[val];
            var sText = oData[oListViewOpt.displayField];

            $('.select-value span.value', selectView).text(sText);

            if (true !== oListViewOpt.multiple) {
                showDropList(false);
            }

            $(oSelect).val(val).change();
            oListViewOpt.onChange && oListViewOpt.onChange.apply(oData,[]);
        }

        function showTip (oItem) {
            oItem = $(oItem);

            var tipStr = '<div class="select-tip"><div class="tip-content"></div><div class="tip-arrow"></div></div>';
            oItem.append(tipStr);
            oItem.find('.tip-content').text(oItem.children('span')[0].innerHTML);

            var scrollTop = oItem.closest('.drop-list').scrollTop();
            var tooltipHeight = $('.tip-content', oItem).height() + 12;
            var itemTop = oItem.position().top;
            var nTop = itemTop + scrollTop - tooltipHeight;

            if (nTop < scrollTop) {
                nTop = itemTop + scrollTop + oItem.height() - 6;
                $('.tip-arrow', oItem).addClass('top-arrow');
            }

            $('.select-tip', selectView).css({
                'top': nTop,
                'left': oItem.position().left
            });
        }

        function removeTip (oItem) {
            oItem = $(oItem);
            oItem.find('.select-tip').remove();
        }

        create();
        setData(oListViewOpt.data);

        return {
            setData: setData
        }
    }

    window.DtUI.SelectView = SelectView;
})(window);

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

(function (Util, factory) {

// 异步操作的同步处理，用于多个异步操作全部完成后再开始新事件的场景
// 注意：每个事件必须是异步操作。
// @para: aModule, Array/String, optional, 字符串数组或者用逗号、分号或者竖线分隔的字符串
// @para: onLoadEnd, Function, aModule中的事件全部完成后的处理函数
// @usage:
//      var oAsync = Async('ecs,rds,slb', onLoadEnd);
//      function onLoadEnd () {
//          // todo: do something after ecs, rds, slb end
//          console.log('all the info is ready');
//      }
//      function sendRequest (url, cb) {
//          setTimeout(function () {
//              cb();
//          }, 100)
//      }
//      function loadEcs () {
//          var url = 'xxx/ecs';
//          sendRequest(url, function () {
//              console.log('ecs is ready');
//              oAsync.done('ecs');
//          });
//      }
//      function loadRds () {
//          var url = 'xxx/rds';
//          sendRequest(url, function () {
//              console.log('rds is ready');
//              oAsync.done('rds');
//          });
//      }
//      function loadSlb () {
//          var url = 'xxx/slb';
//          sendRequest(url, function () {
//              console.log('slb is ready');
//              oAsync.done('slb');
//          });
//      }
    Util.Async = factory;
})(window.Util, function Async (modules, onLoadEnd) {
    var oInstance;
    var sAsyncName = '';

    function BaseAsync () {
        this.name = function (sName) {
            sAsyncName = sName;
        }
    }

    function log (sType, msg, para) {
        var aPara = [sAsyncName];
        if (para) {
            aPara.push(para);
        }

        Util.log(sType, 'Async({{0}}): ' + msg, aPara);
    }

    function NumAsync (nTotal) {
        var nCounter = nTotal || 0;
        var aAction = [];

        function addCb (cb) {
            if (cb && Util.isFunction(cb)) {
                aAction.push(cb);
            }
        }

        function done () {
            if (0 < nCounter) {
                return;
            }

            log('debug', 'All instance end');
            Util.forEach(aAction, function (pfDo, name) {
                pfDo && pfDo();
            });

            aAction.length = 0;
            onLoadEnd = onLoadEnd || oInstance.onReady;
            onLoadEnd && onLoadEnd();
        }

        this.add = function (cb) {
            nCounter++;
            addCb(cb);
        }
        this.done = function (cb) {
            nCounter--;
            addCb(cb);
            done();
        }
        this.reset = function () {
            nCounter = nTotal || 0;
            aAction.length = 0;
        }
    }
    NumAsync.prototype = new BaseAsync();

    function NameAsync (modules) {
        var oNumAsync = new NumAsync();
        var NameMap = {};

        function init () {
            if (Util.isString(modules)) {
                modules = modules.split(/[,;|]/);
            }

            if (!Util.isArray(modules)) {
                return;
            }

            for (var i = 0; i < modules.length; i++) {
                add(modules[i]);
            }
        }

        function add (sName, cb) {
            if (Util.isString(sName)) {
                if (true === NameMap[sName]) {
                    log('warning', 'Duplicate module - {{1}}', sName);
                    return;
                }

                log('debug', 'start {{1}}', sName);
                NameMap[sName] = true;
            }

            oNumAsync.add(cb);
            return sName;
        }

        function done (sName, cb) {
            if (Util.isString(sName)) {
                if (true !== NameMap[sName]) {
                    log('warning', 'Can\'t found module - {{1}}', sName);
                    return;
                }

                log('debug', 'done {{1}}', sName);
            }

            oNumAsync.done(cb);
        }

        function reset () {
            oNumAsync.reset();
        }

        init();
        this.add = add;
        this.done = done;
        this.reset = reset;
    }
    NameAsync.prototype = new BaseAsync();

    function init () {
        if (Util.isFunction(modules)) {
            onLoadEnd = modules;
        }

        if (Util.isNumber(modules)) {
            oInstance = new NumAsync(modules);
        } else {
            oInstance = new NameAsync(modules);
        }
    }

    init();

    return oInstance;
});

