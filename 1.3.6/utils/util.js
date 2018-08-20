function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function isEmpty(obj) {
    for (var name in obj) {
        return false;
    }
    return true;
};
//提示框
function showMessage(that, msg) {
  if (that.data.showMessage) {
    return;
  }
  that.setData({
    showMessage: true,
    messageContent: msg
  })
  setTimeout(() => {
    that.setData({
      showMessage: false,
    })
  }, 3000)
}

function getPrevPage() { //页面
    var pages = getCurrentPages();
    console.log(pages)
    var prevPage = pages[pages.length - 2]; //上一个页面
    return prevPage;
}

var time;

function countdown(that) { //倒计时
    var _array = that.data.timeArray;

    for (var id in _array) {
        var _data = _array[id];
        var tt = _data.num;
        if (tt == 0) {
            _array[id].falg = false;
            that.setData({
                timeArray: _array
            });
        }
    }
    clearTimeout(time);
    if (!isEmptyObject(_array)) {
        time = setTimeout(function() {
            var strM, strS;
            for (var id in _array) {
                var _data = _array[id];
                var tt = _data.num;
                var limit = tt - 1;
                strM = addTen(parseInt(tt / 60));
                strS = addTen(tt % 60);
                _array[id] = { 'num': limit, 'str': '去支付(还剩' + strM + '分' + strS + '秒)', "falg": true };
            }

            that.setData({
                timeArray: _array
            });
            if (strM == '00' && strS == '00') {   //如果订单倒计时时间为0:00就刷新页面
                clearTimeout(time);
                that.onPullDownRefresh();
            }else{
                countdown(that, time);

            }

        }, 1000)
    }
}
/**
 *菜单分类下面的商品列表进行排序
  将对象前面的id进行重新组装 前台在进行循环
 */
function sortByField(obj,key){
  var arr = {};
  for(var i in obj){
    var orderSort = parseInt(obj[i].good_order) + 1;
    arr[Number(orderSort.toString() + i.toString())] = obj[i];
  }
  return arr;
}

function addTen(num) {
    if (num >= 0 && num <= 9) {
        return '0' + num;
    } else {
        return num
    }
}

function isEmptyObject(e) { //判断是否空数组或空josn
    var t;
    for (t in e) return !1;
    return !0
}

function mathTimer(fist, send) { //计算时间
    var t1 = 0,
        t2 = 0,
        t3 = 0,
        t4 = 0,
        str = '',
        _nowHouser = nowHouser(),
        falg = true;
    t1 = parseInt(fist.split('-')[0]);
    t2 = parseInt(fist.split('-')[1]);


    if (!!send) {
        t3 = send ? parseInt(send.split('-')[0]) : 0;
        t4 = parseInt(send.split('-')[1]);
        if ((_nowHouser >= t1 && _nowHouser <= t2) || (_nowHouser >= t3 && _nowHouser <= t4)) {
            falg = false;
        } else {
            falg = true;
            str = '营业时间:' + fist + '~' + send;
        }
    } else {
        if (_nowHouser >= t1 && _nowHouser <= t2) {
            falg = false;
        } else {
            falg = true;
            str = '营业时间:' + fist;
        }
    }

    return { 'falg': falg, 'str': str };
}

function nowHouser() {
    var data = new Date();
    return parseInt(data.getHours());
}


function toDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x * 100) / 100;
    return f;
}

function isJson(obj) {
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}

module.exports = {
    formatTime: formatTime,
    isEmpty: isEmpty,
    countdown: countdown,
    getPrevPage: getPrevPage,
    mathTimer: mathTimer,
    toDecimal: toDecimal,
    isJson,
    sortByField:sortByField,
    showMessage, showMessage
}
