//index.js
//获取应用实例
var app = getApp();
Page({
    data: {
        listIsEnd: false,
        listPage: 1,
        orderList: [],
        scrollHeight: 270
    },
    onLoad: function(options) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
        // // wx.showLoading({ 'title': '加载中', 'mask': true })
        // var access_token = app.access_token || wx.getStorageSync('access_token');
        // var that = this;
        // console.log(`orderList | access_token ${access_token}`)
        // wx.request({
        //     url: "https://xd.repai.com/index.php?ctrl=wxapp&action=orderList",
        //     method: 'GET',
        //     dataType: 'json',
        //     data: { id: app.shopId, page: '1', access_token },
        //     success: function(res) {
        //         var data = res.data.data;
        //         console.log('---------订单详情 start-----------')
        //         console.log(data)
        //         console.log('---------订单详情 end-------------')
        //         that.setData({
        //             orderList: data,
        //         })
        //     },
        //     fail: function(res) {},
        //     complete: function(res) { wx.hideLoading() }
        // })
    },
    onShow: function(e) {
        console.log(this.data.orderList.length);
        try {
            var res = wx.getSystemInfoSync();
            var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - 210 - 70;
            this.setData({
                scrollHeight: scrollHeight
            })
        } catch (e) {}
    },
    loadMoreList: function(e) {
        if (this.data.listIsEnd) {
            return;
        }
        var that = this;
        var orderList = this.data.orderList;
        var nextPage = ++this.data.listPage;
        wx.showLoading({ 'title': '加载中', 'mask': true })
        wx.request({
            url: app._host+"/index.php?ctrl=wxapp&action=orderList",
            method: 'GET',
            dataType: 'json',
            data: { id: app.shopId, page: nextPage },
            success: function(res) {
                var data = res.data.data;
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        orderList.push(data[i]);
                    }
                    that.setData({
                        orderList: orderList,
                    })
                } else {
                    that.setData({
                        listIsEnd: true,
                    })
                }
            },
            fail: function(res) {},
            complete: function(res) { wx.hideLoading() }
        })
    },
    refreshList: function(e) {
        wx.showLoading({ 'title': '加载中', 'mask': true })
        var that = this;
        wx.request({
            url: app._host+"/index.php?ctrl=wxapp&action=orderList",
            method: 'GET',
            dataType: 'json',
            data: { id: app.shopId, page: '1' },
            success: function(res) {
                var data = res.data.data;
                that.setData({
                    orderList: data,
                    listIsEnd: false,
                    listPage: 1,
                })
            },
            fail: function(res) {},
            complete: function(res) { wx.hideLoading() }
        })
    },
    topOrderInfo: function(e) {
        var orderid = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '/pages/orderDetail/index?orderid=' + orderid
        })
    },
    goshop: function(e) {
        //console.log(e)
        var orderid = e.currentTarget.dataset.orderid;
        var totalprice=e.currentTarget.dataset.totalprice;
        console.log(totalprice)
        wx.reLaunch({
            url: '/pages/index/index?orderid=' + orderid +'&totalprice='+totalprice
        })
    },
    gopay: function(e) {
        var orderid = e.currentTarget.dataset.orderid;
        wx.showLoading({ 'title': '提交中', 'mask': true })
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=orderPay&access_token=" + app._access_token,
            method: 'POST',
            dataType: 'json',
            data: { orderid: orderid },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode != 200) {
                    wx.showToast({ title: "网络错误请重试", icon: 'loding' })
                    return;
                }
                var data = res.data;
                if (data.status) {
                    // wx.showLoading({'title':'请求支付','mask':true})
                    wx.requestPayment({
                        'timeStamp': data.data.timeStamp,
                        'nonceStr': data.data.nonceStr,
                        'package': data.data.package,
                        'signType': data.data.signType,
                        'paySign': data.data.paySign,
                        success: function(res) {
                            wx.hideLoading();
                        },
                        fail: function(res) {
                            wx.hideLoading();
                            app.showToast("支付失败", "fail")
                        },
                        complete: function(res) {
                            wx.setStorageSync('cartTemp', {});
                        }
                    })
                } else {
                    app.showToast(data.msg, "fail")
                }
            },
            fail: function(res) {
                wx.hideLoading();
                app.showToast("网络错误", "fail")
            },
            complete: function(res) {}
        })
    },
    cancelOrder: function(e) {
        wx.showLoading({ 'title': '加载中', 'mask': true })
        var orderid = e.currentTarget.dataset.orderid;
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=cancelOrder&access_token=" + app._access_token,
            method: 'GET',
            dataType: 'json',
            data: { orderid: orderid },
            success: function(res) {
                wx.redirectTo({ url: '/pages/orderDetail/index?orderid=' + orderid })
            },
            fail: function(res) {},
            complete: function(res) { wx.hideLoading() }
        })
    },

})
