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
            return window.BhUI.showDialog(opt);
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

    window.BhUI.Message = Message;
})(window);
