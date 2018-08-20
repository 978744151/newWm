var app = getApp()
var utils = require('../../utils/util.js');
var order = require('../../utils/order.js')
var num = 0;
Page({
    data: {
        peopleNum: ["便于商家准备餐具", '1人', '2人', '3人', '4人', '5人', '6人', '7人', '8人', '9人', '10人', '10人以上'],  //用餐人数
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
        useMoney:0,     //优惠券金额
        vouchers_id:null,
        youhui:0,
        reduction_id:null,
		tableId:'',     //餐桌桌号
        disAmount:0,   //折扣金额
        payment: {    //支付信息
            isShow: false,
            balance: '0',
            payMoney: '0',
        },
        formData: {}  //tapPay提交时保存数据
    },
    //扫一扫桌号
    scan:function(){
      // 允许从相机和相册扫码
      wx.scanCode({
        success: (res) => {
          console.log(res)
        }
      })
    },
    getTableId(e){
        // e.detail.value
        console.log(e.detail.value)
    },
    onLoad: function(options) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
        var access_token = app.access_token || wx.getStorageSync('access_token');
        if (app.scene!='1011'){
            options.tableid = '';
        }
        this.setData({
            usableData:wx.getStorageSync('usableData'),        //获取可用优惠券的数据
            access_token,
            crFlag: wx.getStorageSync('crFlag'),
            youhui:options.youhui,
            reduction_id: options.reduction_id,
            skuids: options.skuids,
            hasReduction: options.hasReduction,
			tableId: options.tableid
        });
    },
    onShow: function(options) {
        // this.getData();
        wx.showLoading({
            title: '加载中',
        })
        order.getOrderInfo(
            this, 
            { access_token: this.data.access_token, id: app.shopId},
            { useMoney: this.data.useMoney, youhui: this.data.youhui},
            'cartTemp_ts'
        )
    },
    onReady: function(options) {
        console.log('onReady');
    },
    onPullDownRefresh: function() { //下拉刷新
        // this.getData();
        this.onShow();
    },
    getData(){
        // wx.showLoading({
        //     'title': '加载中',
        //     'mask': true
        // })
        var that = this;
        try {
            var value = wx.getStorageSync('cartTemp_ts'),
                copyValue = JSON.parse(JSON.stringify(value))
            if (value) {
                wx.request({
                    url: app._host + "/index.php?ctrl=wxapp&action=shopcart&access_token=" + this.data.access_token,
                    method: 'GET',
                    dataType: 'json',
                    data: {
                        id: app.shopId
                    },
                    success: function(res) {
                        var data = res.data.data;
                        console.log('是否在配送范围之内',data.deaddress.canps)
                        var address = false;
                        var youhui=that.data.youhui;
                        var useMoney;
                        // if(that.data.useMoney>0){
                        //     useMoney=that.data.useMoney
                        // }else {
                        //     useMoney=0
                        // }
                        if (!utils.isEmpty(data.deaddress)) {
                            address = data.deaddress
                        }
                        value.totalPrice = (Number(value.totalPrice) * parseFloat(data.memberCard.discount) - Number(youhui) - Number(useMoney)).toFixed(2);
                        
                        let disAmount = (parseFloat(copyValue.totalPrice) - parseFloat(youhui) - parseFloat(useMoney) - parseFloat(copyValue.totalPrice) * parseFloat(data.memberCard.discount)).toFixed(2)
                        that.setData({
                            // canps: data.deaddress.canps,
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
                        that.showDialog();
                    }
                })
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    bindPickerChange: function(e) {
        console.log(e.detail.value)
        this.setData({
            sendTimeIndex: e.detail.value
        })
    },
    bindPickerChangeNum: function(e) {
        this.setData({
            peopleNumIndex: e.detail.value
        })
    },
    nowPay(e){   //立即支付
        var that = this,
            skuids = this.data.skuids,
            pay_money = this.data.cartData.totalPrice,
            sendData = this.data.formData.detail.value

        if ( !this.showDialog() ) {
            var minit = '立即配送',
                cartData = this.data.cartData,
                reduction_id,
                vouchers_id;

            Number(this.data.reduction_id) > 0 ? reduction_id = this.data.reduction_id : reduction_id = '';
            Number(this.data.vouchers_id) > 0 ? vouchers_id = this.data.vouchers_id : vouchers_id = '';

            
            wx.request({    //如果是余额支付就直接支付成功，如果是微信支付请接口求成功之后再调用微信支付。
              url: app._host + "/index.php?ctrl=wxapp&action=createOrder&mainType=openTangshi&access_token=" +this.data.access_token,
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
                    tableNo: sendData.tableNo,
                    orderFrom: 'ts',
                    payFrom: e.detail.payMethod === 'balance'?'balance':'weChat'
                },
                success: function(res) {
                    if (res.statusCode != 200) {
                        app.showToast("网络错误请重试", "fail");
                        wx.redirectTo({
                            url: '/pages/oList/index?otype=6',
                        })
                        wx.setStorageSync('cartTemp_ts', {});
                        return;
                    }
                    var data = res.data;
                    if (data.status) {
                        if (e.detail.payMethod==='weChat'){
                            if (data.is_true_pay==0){       //如果选择微信支付，支付金额为0就直接支付成功，跳转页面。
                                wx.redirectTo({
                                    url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                                })
                                wx.setStorageSync('cartTemp_ts', {});
                                wx.removeStorageSync('goodsType');
                                wx.removeStorageSync('anewCart');
                                return;
                            }
                            that.weChatPay(data, pay_money, reduction_id, vouchers_id, skuids)  //微信支付
                        }else{
                            wx.redirectTo({
                                url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                            })
                            wx.setStorageSync('cartTemp_ts', {});
                            wx.removeStorageSync('goodsType');
                            wx.removeStorageSync('anewCart');
                        }
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: data.msg,
                            showCancel: false
                        })
                        if (data.code == 1) {
                            wx.setStorageSync('cartTemp_ts', {});
                            wx.removeStorageSync('goodsType');//后期添加的
                        }
                    }
                },
                fail: function(res) {
                    wx.hideLoading();
                    app.showToast("网络错误请重试", "fail");
                },
                complete: function(res) {
                    app.isResh = 0;
                }
            })
        }
    },
    weChatPay(data, pay_money, reduction_id, vouchers_id, skuids){  //微信支付
        wx.requestPayment({
            'timeStamp': data.data.timeStamp,
            'nonceStr': data.data.nonceStr,
            'package': data.data.package,
            'signType': data.data.signType,
            'paySign': data.data.paySign,
            reduction_id: reduction_id,
            vouchers_id: vouchers_id,
            types: skuids,
            success: function (res) {
                wx.hideLoading();
            },
            fail: function (res) {
                console.log(res);
                wx.hideLoading();
                app.showToast("支付失败", "fail")
            },
            complete: function (res) {
                wx.setStorageSync('cartTemp_ts', {});
                wx.removeStorageSync('goodsType');
                wx.removeStorageSync('anewCart');
                wx.redirectTo({
                    url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                })
            }
        })
    },
    tapPay: function(e) {
        if (!e.detail.value.tableNo) {app.showToast('请填写桌台号');return}
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
	Imgscan:function(){   //扫码添加桌号
		var that = this;
		wx.scanCode({
			onlyFromCamera:true,
			success:function(res){
				console.log(res)
				if (res.hasOwnProperty('path')){
					wx.request({
						url: app._host + '/index.php?ctrl=wxapp&action=shopTableInfo&id=' + that.getQuery(res.path, 'storeid') + '&tablesid=' + that.getQuery(res.path, 'tablesid'),
						success:function(res){
							console.log(res)
							that.setData({
								tableId: res.data.data.info.title
							})
						}
					})
				}else{
					console.log('sssss')
					app.showErrorModal('请扫描正确的二维码')
				}
				// if (res.hasownproperty('path')){

				// }else{
				// 	console.log('错误')
				// }
			}
		})
	},
	getQuery:function(url,name){   //从路由获取参数
		var query = url.split('?')[1].split('&')
		for(let i = 0;i<query.length;i++){
			let T = query[i].split('=');
			if(T[0]==name){
				return T[1]
			}
		}
		return false
	}

})