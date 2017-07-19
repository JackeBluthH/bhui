/*
插件管理工具
*/
function DtPlugin (sSupportPlugin) {
    var aPlugin = [];
    var oFastList = {};

    function fastList (sSupportPlugin) {
        if ('all' === sSupportPlugin) {
            oFastList = true;
            return;
        }

        var aList = sSupportPlugin.split(',');
        for (var i = 0; i < aList.length; i++) {
            oFastList[aList[i]] = true;
        }
    }

    function addPlugin (sName, factory) {
        if (true === oFastList || true === oFastList[sName]) {
            aPlugin.push({name: sName, factory: factory});
        }
    }

    function startPlugins (options) {
        for (var i = 0; i < aPlugin.length; i++) {
            aPlugin[i].instance = aPlugin[i].factory(options);
        }
    }

    function runPlugins (container) {
        for (var i = 0; i < aPlugin.length; i++) {
            aPlugin[i].instance.create(container);
        }
    }

    function reset() {
        for (var i = 0; i < aPlugin.length; i++) {
            if(aPlugin[i].instance && aPlugin[i].instance.reset) {
                aPlugin[i].instance.reset();
            }
        }
    }

    function main () {
        // 默认只加载license插件
        fastList(sSupportPlugin || 'all');
    }

    main();

    this.add = addPlugin;
    this.start = startPlugins;
    this.run = runPlugins;
    this.reset = reset;
}
