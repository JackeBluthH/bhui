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

    window.BhUI.InputRange = InputRange;
})(window);
