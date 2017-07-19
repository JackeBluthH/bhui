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

    window.BhUI.showDialog = showDialog;
})(window);
