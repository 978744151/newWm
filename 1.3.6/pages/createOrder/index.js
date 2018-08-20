var app = getApp()
var utils = require('../../utils/util.js');
var num = 0;
const order = require('../../utils/order.js')
Page({
    data: {
        peopleNum: ["便于商家准备餐具", '1人', '2人', '3人', '4人', '5人', '6人', '7人', '8人', '9人', '10人', '10人以上'],
        deaddress: false,
        shopInfo: {},
        cartData: {},
        sendTimeList: [],
        sendTimeIndex: 0,
        peopleNumIndex: 0,
        sendTimer: '',
        isOpen: 1,
        dialog: {
            flag: false,
            title: '',
            txt: '',
        },
        access_token: null,
        useMoney:0,
        vouchers_id:null,
        youhui:0,
        reduction_id:null,
        disAmount:0,
        payment: {    //支付信息
            isShow: false,
            balance: '0',
            payMoney: '0',
        },
        formData: {}  //tapPay提交时保存数据
    },
    onLoad: function(options) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
        var access_token = app.access_token || wx.getStorageSync('access_token');
        this.setData({
            usableData:wx.getStorageSync('usableData'),        //获取可用优惠券的数据
            access_token,
            crFlag: wx.getStorageSync('crFlag'),
            //useMoney:options.useMoney,
            //vouchers_id:options.vouchers_id,
            youhui:options.youhui,
            reduction_id: options.reduction_id,
            skuids: options.skuids,
            hasReduction: options.hasReduction
        });

    },
    onShow: function (options) {
        // this.getData()
        wx.showLoading({
            title: '加载中',
        })
        order.getOrderInfo(
            this,
            { access_token: this.data.access_token, id: app.shopId },
            { useMoney: this.data.useMoney, youhui: this.data.youhui },
            'cartTemp'
        )
    },
    getData(){ //没用到 已封装到order.js
        wx.showLoading({
            'title': '加载中',
            'mask': true
        })
        var that = this;
        try { //try catch
            var value = wx.getStorageSync('cartTemp'),
                copyValue = JSON.parse(JSON.stringify(value));
            if (value) {
                wx.request({
                    url: app._host + "/index.php?ctrl=wxapp&action=shopcart&access_token=" + this.data.access_token,
                    method: 'GET',
                    dataType: 'json',
                    data: {
                        id: app.shopId
                    },
                    success: function(res) {
                        console.log(res)
                        wx.hideLoading();
                        var data = res.data.data;
                        console.log('是否在配送范围之内',data.deaddress.canps)
                        var address = false;
                        console.log(!utils.isEmpty(data.deaddress))
                        var youhui=that.data.youhui;
                        console.log(youhui)
                        var useMoney;
                        if(that.data.useMoney>0){
                            useMoney=that.data.useMoney
                        }else {
                            useMoney=0
                        }
                        if (!utils.isEmpty(data.deaddress)) {
                            address = data.deaddress
                        }
                        console.log(useMoney)
                        console.log(youhui)
                        // if (address.newpscost > 0) {
                        //     value.totalPrice = (Number(value.totalPrice) + Number(address.newpscost)).toFixed(2);
                        // }
                        // value.totalPrice = (Number(value.totalPrice) + (Number(address.newpscost)>0?Number(address.newpscost):0)-Number(youhui)-Number(useMoney)).toFixed(2);
                        value.totalPrice = (Number(value.totalPrice) * parseFloat(data.memberCard.discount) - Number(youhui) - Number(useMoney) + (Number(address.newpscost) > 0 ? Number(address.newpscost) : 0)).toFixed(2);//- Number(value.totalBag) 之前减去了餐盒费。
                        let disAmount = (parseFloat(copyValue.totalPrice) - parseFloat(youhui) - parseFloat(useMoney) - parseFloat(copyValue.totalPrice) * parseFloat(data.memberCard.discount) ).toFixed(2)//

                        console.log(value.totalPrice)

                        // data.shopinfo.shoplogo = _itemImg || data.shopinfo.shoplogo;
                        that.setData({
                            canps: data.deaddress.canps,
                            sendTimeList: data.timelist,
                            deaddress: address,
                            shopInfo: data.shopinfo,
                            cartData: value,
                            sendtime: data.sendtime,
                            isOpen: data.shopinfo.is_open,
                            sTotalBag: Number(value.totalBag).toFixed(2),
                            disAmount,
                            userInfo: data.memberCard
                        })

                    },
                    fail: function(res) {
                        wx.hideLoading();
                        app.showToast("网络错误请重试", "fail")
                    },
                    complete: function(res) {
                        if (orderType !=='cartTemp_zt'){
                            that.showDialog();
                        }
                    }
                })
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    onReady: function(options) {
        // console.log('onReady');
    },
    onPullDownRefresh: function() { //下拉刷新
    //    this.getData()
        this.onShow();
    },
    bindPickerChange: function(e) {  //没用到
        this.setData({
            sendTimeIndex: e.detail.value
        })
    },
    bindPickerChangeNum: function(e) { //用餐人数
        console.log(e.detail.value)
        this.setData({
            peopleNumIndex: e.detail.value
        })
    },
    tapAddress: function(e) { //更换地址
        var that = this;
        wx.navigateTo({
            url: '/pages/address/index'
        })
    },
    nowPay(e){ //支付
        var that = this,
            skuids = this.data.skuids,
            pay_money = this.data.cartData.totalPrice;
        if (!this.showDialog()) {

            var sendData = this.data.formData.detail.value,
                minit = '立即配送',
                cartData = this.data.cartData,
                reduction_id,
                vouchers_id;
            
            Number(this.data.reduction_id) > 0 ? reduction_id = this.data.reduction_id :reduction_id = '';
            Number(this.data.vouchers_id) > 0 ? vouchers_id = this.data.vouchers_id : vouchers_id = '';


            wx.request({
                url: app._host + "/index.php?ctrl=wxapp&action=createOrder&mainType=openWaimai&access_token=" +this.data.access_token,
                method: 'POST',
                dataType: 'json',
                data: {
                    shopid: app.shopId,
                    remark: sendData.remark,
                    minit: minit,
                    peopleNum: sendData.peopleNum,
                    cartData: cartData,
                    reduction_id:reduction_id,
                    vouchers_id:vouchers_id,
                    types: skuids,
                    orderFrom: 'wm',
                    payFrom: e.detail.payMethod === 'balance'?'balance':'weChat'
                },
                success: function(res) {
                    console.log(res)
                    if (res.statusCode != 200) {
                        app.showToast("网络错误请重试", "fail");
                        wx.redirectTo({
                            url: '/pages/index/index?showorder=1',
                        })
                        wx.setStorageSync('cartTemp', {});
                        return;
                    }
                    var data = res.data;
                    if (data.status) {
                        if (e.detail.payMethod==='weChat'){
                            if (data.is_true_pay == 0) {       //如果选择微信支付，支付金额为0就直接支付成功，跳转页面。
                                wx.redirectTo({
                                    url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                                })
                                wx.setStorageSync('cartTemp', {});
                                wx.removeStorageSynDifferTimec('goodsType');
                                wx.removeStorageSDifferTimeync('anewCart');
                                return;
                            }
                            that.weChatPay(data, pay_money, reduction_id, vouchers_id, skuids)  //微信支付
                        }else{
                            wx.redirectTo({
                                url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                            })
                            wx.setStorageSync('cartTemp', {});
                            wx.removeStorageSync('goodsType');
                            wx.removeStorageSync('anewCart');
                        }
                    } else {
                        wx.hideLoading();
                        console.log(data);
                        wx.showModal({
                            title: '提示',
                            content: data.msg,
                            showCancel: false
                        })
                        if (data.code == 1) {
                            console.log(111111)
                            console.log(res)
                            wx.setStorageSync('cartTemp', {});
                            wx.removeStorageSync('goodsType');//后期添加的
                            //库存不足
                            // wx.redirectTo({
                            //   url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                            // })
                        }
                    }
                },
                fail: function(res) {
                    console.log(res);
                    wx.hideLoading();
                    // wx.showToast({ title: "网络错误" })
                    app.showToast("网络错误请重试", "fail");
                },
                complete: function(res) {
                    app.isResh = 0;
                }
            })
        }
    },
    weChatPay(data, pay_money, reduction_id, vouchers_id, skuids){
        wx.requestPayment({
            'timeStamp': data.data.timeStamp,
            'nonceStr': data.data.nonceStr,
            'package': data.data.package,
            'signType': data.data.signType,
            'paySign': data.data.paySign,
            reduction_id:reduction_id,
            vouchers_id:vouchers_id,
            types: skuids,
            success: function(res) {
                wx.hideLoading();
            },
            fail: function(res) {
                console.log(res);
                wx.hideLoading();
                app.showToast("支付失败", "fail")
            },
            complete: function(res) {
                console.log('支付失败')
                console.log(res)
                wx.setStorageSync('cartTemp', {});
                wx.removeStorageSync('goodsType');
                wx.removeStorageSync('anewCart');
                wx.redirectTo({
                    url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                })
            }
        })
    },
    tapPay: function(e) {//bindsubmit地址
        console.log(e)
        if (!this.data.deaddress) {
            app.showToast('请设置默认地址');
            return
        }
        if (!this.showDialog()){
            this.setData({
                payment: {
                    isShow: true,
                    balance: this.data.userInfo.balance,
                    payMoney: this.data.cartData.totalPrice,
                },
                formData: e
            })
        }
    },
    tabredPacket:function(){
        var youhui=this.data.youhui;
        var reduction_id = this.data.reduction_id;
        var vouchers_id = this.data.vouchers_id;
        var hasReduction = this.data.hasReduction;
        wx.navigateTo({
          url: '/pages/redPacket/index?youhui=' + youhui + '&reduction_id=' + reduction_id + '&vouchers_id=' + vouchers_id + "&hasReduction=" + hasReduction
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
    closeDialog: function() {
        var _dialog = this.data.dialog;
        _dialog.flag = false;
        this.setData({
            dialog: _dialog
        })
    },

})