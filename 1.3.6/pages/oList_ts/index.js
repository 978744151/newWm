//index.js
//获取应用实例
var app = getApp();
var AJAXFLAG = true;
var utils = require('../../utils/util.js');
var API = require('../../utils/api.js');
Page({
    data: {
        listIsEnd: false,
        listPage: 1,
        orderList: [],
        scrollHeight: 270,
        currentTab: 1,
        corderHeight: 0,
        timeArray: {},
        scrollTopNum: 0,
        payment: { //支付信息
            isShow: false,
            balance: '0',
            payMoney: '0',
        },
        formData: {} //tapPay提交时保存数据
    },
    noticeOrder: function(e) { //拨打电话 || 催单
        console.log(e)
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone //仅为示例，并非真实的电话号码
        })
    },
    moveView(e) {
        var that = this;
        if (!this.data.isUpper) {
            if (e.detail.scrollTop <= 0) {
                that.setData({
                    isUpper: true
                })
                setTimeout(function() {
                    that.getOrderList();
                }, 1500)
            }
        }
    },
    returnOrder: function() { //返回主页重新获取订单列表 isList制0
        console.log('------------isList-----------------')
        console.log(app.isList)
        console.log('------------isList-----------------')
        if (app.isList == 1) {
            this.z_list();
            app.isList = 0;

        }
    },
    goshop: function(e) { //再来一单
        var orderid = e.currentTarget.dataset.orderid,
            index = e.currentTarget.dataset.index,
            _orderList = this.data.orderList,
            totalprice = e.currentTarget.dataset.totalprice;
        console.log('----订单列表index-----')
        console.log('价格1：' + totalprice)
        this.setData({
            totalprice: totalprice
        })
        console.log(index);
        console.log('----订单列表index end-----')
        console.log(_orderList)
        console.log(index)
        wx.setStorageSync('anewCart', _orderList[index].listdet);
        console.log(_orderList[index].listdet)
        if (this.data.currentTab == 0) {
            wx.navigateTo({
                url: '../index_ts/index?orderid=' + orderid + '&totalprice=' + totalprice,
            })
        } else {
            wx.navigateTo({
                url: '../index_wm/index?orderid=' + orderid + '&totalprice=' + totalprice,
            })
        }
        // wx.reLaunch({
        //   url: '/pages/index/index?orderid=' + orderid + '&totalprice=' + totalprice
        // })
        console.log('再来一点的时候获取 _orderList[index]', _orderList[index])
        console.log('再来一点的时候获取的列表', _orderList[index].listdet)
    },

    closeOrder: function(e) { //取消订单
        var orderid = e.currentTarget.dataset.orderid,
            that = this;
        API.moduleCloselOrder(this, orderid).then((res) => {
            app.isList = 1; //刷新列表
            that.returnOrder();
        }, (err) => {
            app.showToast('取消订单失败');
        })
    },
    // 导航切换
    swichNav: function(e) {
        this.setData({
            currentTab: e.target.dataset.current
        })
        this.z_list();
    },
    bindChange: function(e) {
        var that = this;
        this.setData({
            currentTab: e.detail.current
        })
        this.z_list();
    },
    getOtype: function() {
        var currentTab = this.data.currentTab || 0;
        if (currentTab == 0) return 6;
        if (currentTab == 1) return 7;
        if (currentTab == 2) return 3;
        return 5;
    },
    getOrderList: function() {
        var access_token = app.access_token || wx.getStorageSync('access_token');
        var otype = this.getOtype();

        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=orderList",
            method: 'GET',
            dataType: 'json',
            data: {
                id: app.shopId,
                page: '1',
                access_token,
                otype: otype
            },
            success: function(res) {
                var data = res.data.data;
                console.log('---------订单详情 start-----------')
                console.log(data)
                console.log('---------订单详情 end-------------')
                that.setData({
                    orderList: data,
                })
            },
            fail: function(res) {},
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },
    z_list: function() {
        var access_token = app.access_token || wx.getStorageSync('access_token');
        var otype = this.getOtype();

        var that = this;
        //获取订单列表
        var access_token = app.access_token || wx.getStorageSync('access_token');
        if (AJAXFLAG) {
            AJAXFLAG = false;
            // wx.showLoading({ 'title': '加载中', 'mask': true })
            var that = this;
            wx.request({
                url: app._host + "/index.php?ctrl=wxapp&action=orderList",
                method: 'GET',
                dataType: 'json',
                data: {
                    id: app.shopId,
                    page: '1',
                    access_token,
                    otype: otype,
                },
                success: function(res) {
                    if (res.statusCode != 200) {
                        app.showToast("网络错误请重试", "fail")
                        var data = [];
                    } else if (!res.data.status) {
                        app.showToast(res.data.msg)
                        var data = []
                    } else {
                        var data = res.data.data;
                        wx.hideLoading();
                    }
                    if (data.length > 0) {
                        var listIsEnd = false;
                    } else {
                        var listIsEnd = true;
                    }
                    if (res.data.status == true && res.data.data.length > 0) {
                        var dataLength = res.data.data;
                        that.setData({
                            length: dataLength[0].total_num,
                        })
                    }
                    that.setData({
                        // length:dataLength[0].total_num,
                        orderList: data,
                        shopCart: false,
                        listIsEnd: listIsEnd,
                        // cpage: 1  后期注销的
                    })
                    data.map((orderItem) => {
                        let _id = orderItem.id;
                        var _forList = orderItem.statusInfo.btn;
                        for (var i = 0; i < _forList.length; i++) {
                            let temp = that.data.timeArray || {};
                            if (_forList[i].hasOwnProperty('lessTime')) {
                                temp[_id] = {
                                    "num": _forList[i].lessTime,
                                    "str": _forList[i].name,
                                    "falg": true
                                };
                                // console.log(timeArray);
                                return;
                                that.setData({
                                    timeArray: temp
                                });
                            }
                        }
                    })
                    utils.countdown(that);
                    wx.hideLoading();
                },
                fail: function(res) {
                    wx.hideLoading();
                    app.showToast("网络错误请重试", "fail")
                },
                complete: function(res) {
                    wx.hideLoading();
                    AJAXFLAG = true;
                    that.setData({
                        isUpper: false
                    })
                }
            })
        }
    },
    //快速买单
    gotransfer: function() {
        wx.navigateTo({
            url: '/pages/pay/pay'
        })
    },
    onLoad: function(options) {
        if (options.hasOwnProperty("currentTab")) {
            this.setData({
                currentTab: options.currentTab
            })
        } else {
            this.setData({
                currentTab: this.data.currentTab
            })
        }
        
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    corderHeight: res.windowHeight - 40,
                });
            },
        });
        var access_token = app.access_token || wx.getStorageSync('access_token');

    },
    onShow: function(e) {
        var that = this;        
        app.getMemberCard();  //TODO 没用吧？
        var otype = this.getOtype();
        that.z_list();
        var ocolor = wx.getStorageSync('ocolor');
        var fcolor = "#000000"
        if (ocolor != "#ffffff") {
            fcolor = '#ffffff'
        }
        wx.setNavigationBarColor({
            frontColor: fcolor,
            backgroundColor: ocolor
        });
        try {
            var res = wx.getSystemInfoSync();
            var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - 80 - 10;
            this.setData({
                scrollHeight: scrollHeight
            })
        } catch (e) {};
    },
    loadMoreList: function(e) {
        var otype = this.getOtype();
        var access_token = app.access_token || wx.getStorageSync('access_token');
        if (this.data.listIsEnd) {
            return;
        }
        if (AJAXFLAG) {
            AJAXFLAG = false;
            var that = this;
            var orderList = this.data.orderList;
            var nextPage = ++this.data.listPage;
            //wx.showLoading({ 'title': '加载中', 'mask': true })
            this.setData({
                isMore: true
            })
            wx.request({
                url: app._host + "/index.php?ctrl=wxapp&action=orderList",
                method: 'GET',
                dataType: 'json',
                data: {
                    id: app.shopId,
                    page: nextPage,
                    access_token,
                    otype: otype
                },
                success: function(res) {
                    console.log(2)
                    if (res.statusCode != 200) {
                        app.showToast("网络错误请重试", "fail");
                        return;
                    } else if (!res.data.status) {
                        console.log(4)
                        //app.showToast(res.data.msg);
                        return;
                    } else {
                        var data = res.data.data;
                        wx.hideLoading();
                    }
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
                    data.map((orderItem) => {
                        let _id = orderItem.id;
                        var _forList = orderItem.statusInfo.btn;
                        for (var i = 0; i < _forList.length; i++) {
                            let temp = that.data.timeArray || {};
                            if (_forList[i].hasOwnProperty('lessTime')) {
                                temp[_id] = {
                                    "num": _forList[i].lessTime,
                                    "str": _forList[i].name,
                                    "falg": true
                                };
                                that.setData({
                                    timeArray: temp
                                });
                            }
                        }
                    })
                    utils.countdown(that);
                    that.setData({
                        isUpper: false
                    })
                },
                fail: function(res) {
                    app.showToast("网络错误请重试", "fail");
                    AJAXFLAG = true;
                },
                complete: function(res) {
                    console.log(3)
                    wx.hideLoading();
                    AJAXFLAG = true;
                    that.setData({
                        isUpper: false,
                        isMore: false
                    })
                }
            })
        }
    },
    refreshList: function(e) {
        wx.showLoading({
            'title': '加载中',
            'mask': true
        })
        var otype = this.getOtype();
        var access_token = app.access_token || wx.getStorageSync('access_token');
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=orderList",
            method: 'GET',
            dataType: 'json',
            data: {
                id: app.shopId,
                page: '1',
                access_token: access_token,
                otype: otype
            },
            success: function(res) {
                var data = res.data.data;
                that.setData({
                    orderList: data,
                    listIsEnd: false,
                    listPage: 1,
                })
            },
            fail: function(res) {},
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },
    topOrderInfo: function(e) {
        var orderid = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '/pages/orderDetail/index?orderid=' + orderid
        })
    },
    
    nowPay(e) {
        var that = this;
        var orderid = this.data.formData.currentTarget.dataset.orderid;
        wx.showLoading({
            'title': '提交中',
            'mask': true
        })
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=orderPay&access_token=" + app._access_token,
            method: 'POST',
            dataType: 'json',
            data: {
                orderid: orderid,
                payFrom: e.detail.payMethod === 'balance' ? 'balance' : 'weChat'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: "网络错误请重试",
                        icon: 'loding'
                    })
                    return;
                }
                var data = res.data;
                if (data.status) {
                    // wx.showLoading({'title':'请求支付','mask':true})
                    if (e.detail.payMethod === 'weChat') {
                        wx.requestPayment({
                            'timeStamp': data.data.timeStamp,
                            'nonceStr': data.data.nonceStr,
                            'package': data.data.package,
                            'signType': data.data.signType,
                            'paySign': data.data.paySign,
                            success: function(res) {
                                wx.hideLoading();
                                wx.showLoading({})
                                that.onShow();
                                
                            },
                            fail: function(res) {
                                wx.hideLoading();
                                app.showToast("支付失败", "fail")
                            },
                            complete: function(res) {
                                wx.setStorageSync('cartTemp', {});
                                that.setData({
                                    'payment.isShow': false
                                })
                            }
                        })
                    }else{
                          wx.showLoading({})
                          that.setData({
                              'payment.isShow': false
                          })
                           that.onShow();                 
                    }

                } else {
                    app.showToast(data.msg, "fail")
                }
            },
            fail: function(res) {
                wx.hideLoading();
                app.showToast("网络错误", "fail")
            },
            complete: function(res) {
            }
        })
    },
    gopay: function(e) {
        this.setData({
            payment: {
                isShow: true,
                balance: app.userBalance,
                payMoney: e.currentTarget.dataset.money,
            },
            formData: e
        })

    },
    cancelOrder: function(e) {
        wx.showLoading({
            'title': '加载中',
            'mask': true
        })
        var orderid = e.currentTarget.dataset.orderid;
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=cancelOrder&access_token=" + app._access_token,
            method: 'GET',
            dataType: 'json',
            data: {
                orderid: orderid
            },
            success: function(res) {
                wx.navigateTo({
                    url: '/pages/orderDetail/index?orderid=' + orderid
                })
            },
            fail: function(res) {},
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },
    confirmOrder: function(e) {
        wx.showLoading({
            'title': '加载中',
            'mask': true
        })
        var orderid = e.currentTarget.dataset.orderid;
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=confirmOrder&access_token=" + app._access_token,
            method: 'GET',
            dataType: 'json',
            data: {
                orderid: orderid
            },
            success: function(res) {
                wx.navigateTo({
                    url: '/pages/orderDetail/index?orderid=' + orderid
                })
            },
            fail: function(res) {},
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },
    onPullDownRefresh: function() {

        this.refreshList();
        wx.stopPullDownRefresh();
        this.setData({
            scrollTopNum: 0,
        })
    }

})