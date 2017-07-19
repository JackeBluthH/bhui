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
