/**
 * 订单详情页 orderDetail 
 * created 2017-06-07
 */

//index.js
//获取应用实例
var app = getApp(),
    utils = require('../../utils/util.js'),
    API = require('../../utils/api.js');
var zynetwork = require('../../zynetwork.js');
var shop_id;
Page({
    data: {
        zState:false,
        orderInfo: [],
        timeArray: {},
        status:1,
        zxlPrice:'',
        payment: {    //支付信息
            isShow: false,
            balance: '0',
            payMoney: '0',
        },
        formData: {}  //tapPay提交时保存数据
    },
    showimg:function(){
      this.setData({ zState:true})
    },
    hideimg:function(){
      this.setData({ zState: false })
    },
    onLoad: function(options) {
        console.log(app._access_token,'_access_token_access_token_access_token_access_token_access_token')
        // app.getMemberCard();
        shop_id=wx.getStorageSync('shop_id');
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
      this.setData({
        crFlag: wx.getStorageSync('crFlag'),
          sendtype:wx.getStorageSync('sendtype'),
          pay_money: options.pay_money
      });
      this.intoShop();
        console.log('------onLoad 订单详情页-------')
        wx.showLoading({ 'title': '加载中', 'mask': true })
        var orderid = options.orderid;
        API.moduleGetOrderDetail(this, orderid);
        // console.log
        //获取优惠及满减的价格
        console.log(this.data.orderInfo)
    },

    intoShop:function(){
        var that = this;
        var pay_money = that.data.pay_money;
        console.log(pay_money)
        zynetwork.apiUrl('activity/queryIsHasIntoVouchers', { shop_id: app.shopId, get_rule: 'pay', pay_money: pay_money},(res)=>{
            if(res.status<=0){
                that.setData({status:res.status})
            }else {that.setData({status:res.status})}
        })
    },

    //支付成功立即领取
    getCoupon:function () {
        var that = this;
        var pay_money = that.data.pay_money;
        zynetwork.apiUrl('activity/givingVouchers', { shop_id: app.shopId, get_rule: 'pay' ,pay_money: pay_money},(res)=>{
            if(res.status<=0){
                wx.setStorage({
                  key:"data",
                  data:res.data
                });
                wx.navigateTo({url: '/pages/getCoupon/index'})
                that.setData({ status:1})
            }
        })
    }
    ,
    onPullDownRefresh: function() { //下拉刷新
        this.intoShop();
        console.log('--------下拉刷新------------');
        var orderid = this.data.orderid;
        // wx.showNavigationBarLoading() //在标题栏中显示加载
        API.moduleGetOrderDetail(this, orderid, function() {
            // wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
        });
    },
    callShop: function(e) {
        console.log(e)
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone //仅为示例，并非真实的电话号码
        })
    },
    goshop: function(e) {
        var orderid = e.currentTarget.dataset.orderid;
        var totalprice = this.data.orderInfo.order.allcost;
        // var anewCart = wx.getStorageSync('anewCart');
        wx.setStorageSync('anewCart', this.data.orderInfo.orderdet);
        app.isList = 0;

        if (this.data.orderInfo.order.ordertype == 6) {
          wx.navigateTo({
            url: '../index_ts/index?orderid=' + orderid + '&totalprice=' + totalprice,
          })
        } else if (this.data.orderInfo.order.ordertype == 3) {
          wx.navigateTo({
            url: '../index_wm/index?orderid=' + orderid + '&totalprice=' + totalprice,
          })
        } else {
          wx.redirectTo({
                // url: '/pages/index/index?orderid=' + orderid + '&totalprice=' + totalprice,
              url: '../index_zt/index?orderid=' + orderid + '&totalprice=' + totalprice,
            })
        }
    },
    nowPay(e){
        let type = e.detail.payMethod,
            orderid = this.data.formData.currentTarget.dataset.orderid,
            data = this.data.formData;
        API.moduleGoPay(this, data,type).then((res) => {
            wx.redirectTo({
                url: '/pages/orderDetail/index?orderid=' + orderid
            })
            app.showToast("支付成功", "success");
        }, (res) => {
            app.showToast("支付失败");
        });
    },
    gopay: function(e) { //去支付
        this.setData({
            payment: {
                isShow: true,
                balance: app.userBalance,
                payMoney: this.data.zxlPrice,
            },
            formData:e
        })
        return;
    },
    cancelOrder: function(e) {
        var orderid = e.currentTarget.dataset.orderid,
            that = this;
        console.log('cancelOrder')
        API.moduleCancelOrder(this, orderid).then((res) => {
            API.moduleGetOrderDetail(that, orderid);
        }, (err) => {
            app.showToast('取消订单失败');
        })
    },
    closeOrder: function(e) {
        var orderid = e.currentTarget.dataset.orderid,
            that = this;
        console.log('closeOrder')
        API.moduleCloselOrder(this, orderid).then((res) => {
            API.moduleGetOrderDetail(that, orderid);
        }, (err) => {
            app.showToast('取消订单失败');
        })
    },
    confirmOrder: function(e) {
        wx.showLoading({ 'title': '加载中', 'mask': true })
        var orderid = e.currentTarget.dataset.orderid;
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=confirmOrder&access_token=" + wx.getStorageSync('access_token'),
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
    noticeOrder: function(e) {
        console.log(e)
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone //仅为示例，并非真实的电话号码
        })
    },
    showDialog: function() { //弹出框
        var _tilte = '',
            _txt = '',
            flag = false,
            _shopHours = wx.getStorageSync('shopDetail').shopHours,
            timerFist = _shopHours.split('|')[0],
            timerSecend = _shopHours.split('|')[1];
        if (utils.mathTimer(timerFist, timerSecend).falg) {
            _tilte = '小店不在营业时间';
            _txt = utils.mathTimer(timerFist, timerSecend).str;
            flag = true;
            console.log(_txt)
        }

        if (this.data.isOpen == 0) {
            _tilte = '小店打烊啦~';
            _txt = '非常抱歉给您带来的不便';
            flag = true;
        }

        this.setData({
            dialog: {
                flag: flag,
                title: _tilte,
                txt: _txt,
            }
        })
        return flag;
    },
    copy:function (e) {//复制订单号码
       var copyCon=e.currentTarget.dataset.copynum;
        wx.setClipboardData({
            data:copyCon,
            success: function(res) {}
        });
        wx.showToast({
            title: '复制成功',
            icon: 'success',
            duration: 2000
        })
    },
    closeDialog: function() { //关闭弹窗
        var _dialog = this.data.dialog;
        _dialog.flag = false;
        this.setData({
            dialog: _dialog
        })
    }
})