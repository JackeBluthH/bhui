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

    window.BhUI.SelectView = SelectView;
})(window);
