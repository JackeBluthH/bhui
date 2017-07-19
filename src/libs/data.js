
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

    var BhData = {
        save: function (sFileName, sText, cb) {
            return true; //FileObject.save(sFileName, sText, cb);
        },
        load: function (sFileName) {
            return true; //FileObject.load(sFileName);
        }
    }

    window.BhData = BhData;
})(window);
