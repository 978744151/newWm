var app = getApp()
var utils = require('../../utils/util.js');
var dateTimePicker = require('../../utils/dateTimePicker.js');
const order = require('../../utils/order.js')
var num = 0;
Page({
  data: {
    peopleNum: ["便于商家准备餐具", '1人', '2人', '3人', '4人', '5人', '6人', '7人', '8人', '9人', '10人', '10人以上'],
    loginCode: '',
    deaddress: false,
    shopInfo: {},
    cartData: {},
    sendTimeList: [],
    sendTimeIndex: 0,
    peopleNumIndex: 0,
    startYear: 2018,
    endYear: 2019,
    sendTimer: '',
    isOpen: 1,
    dialog: {
      flag: false,
      title: '',
      txt: '',
    },
    access_token: null,
    useMoney: 0,
    vouchers_id: null,
    youhui: 0,
    reduction_id: null,
    multiIndex: [0, 0, 0, 0, 0],
    multiArray: [],
    ztTime: '',
    mobile: '',
    isTime: false, //选择时间
    pickerTimeList: [], //总时间数据
    pickerTimeIndex: 0, //选择时间对应下标
    pickerTimeRight: [], //选择下标对应时间列表
    pickerTimeRightIndex: null, //时间列表选中下标
    disAmount: 0, //会员折扣金额
    payment: { //支付信息
      isShow: false,
      balance: '0',
      payMoney: '0',
    },
    formData: {} //tapPay提交时保存数据

  },
  showPickerTime() { //控制PICKTIME显示隐藏
    this.setData({
      isTime: !this.data.isTime
    })
    this.countZTtime();
  },
  pickerDay(e) { //选择某一天
    let index = e.currentTarget.dataset.index;
    console.log(index)
    this.setData({
      pickerTimeIndex: index,
      pickerTimeRight: this.data.pickerTimeList[index].time_list,
      pickerTimeRightIndex: 0
    })
  },
  pickerHour(e) { //选择精确时间
    let index = e.currentTarget.dataset.index;
    this.setData({
      pickerTimeRightIndex: index
    })
    this.showPickerTime();
  },
  countZTtime() { //计算zTtime时间
    let ztTime = null;
    if (this.data.pickerTimeIndex == 0 && this.data.pickerTimeRightIndex == null) {
      ztTime = '请选择取餐时间'
    } else if (this.data.pickerTimeIndex == 0 && this.data.pickerTimeRightIndex == 0) {
      ztTime = '支付成功直接取餐'
    } else {
      ztTime = this.data.pickerTimeList[this.data.pickerTimeIndex].day + ' ' + this.data.pickerTimeList[this.data.pickerTimeIndex].time_list[this.data.pickerTimeRightIndex]
    }
    this.setData({
      ztTime
    })
  },
  getPickerTime() { //获取PICKERTIME数据
    let shopId = wx.getStorageSync('shop_id'),
      location = wx.getStorageSync('addressFlag'),
      _that = this;
    wx.request({
      url: app._host + `?ctrl=wxapp&action=getFoodTime&id=${shopId}&lat=${location.lat}&lng=${location.lng}&version=${app._version}`,
      success: function(res) {
        _that.setData({
          pickerTimeList: res.data.data,
          pickerTimeRight: res.data.data[_that.data.pickerTimeIndex]['time_list'],
          ztTime: "请选择取餐时间",
        })
      }
    })
  },
  onLoad: function(options) {
    var that = this;
    

    this.getPickerTime();
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: wx.getStorageSync('color')
    });
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear, '', 5);
    var access_token = app.access_token || wx.getStorageSync('access_token');
    this.setData({
      usableData: wx.getStorageSync('usableData'), //获取可用优惠券的数据
      access_token,
      crFlag: wx.getStorageSync('crFlag'),
      //useMoney:options.useMoney,
      //vouchers_id:options.vouchers_id,
      youhui: options.youhui,
      reduction_id: options.reduction_id,
      skuids: options.skuids,
      hasReduction: options.hasReduction,
      multiArray: obj1.dateTimeArray
    });

    console.log(wx.getStorageSync('usableData'))
    console.log(this.data.reduction_id)
    console.log(typeof this.data.useMoney)
  },
  bindMultiPickerChange: function(e) { //修改后弃用
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var multiArray = this.data.multiArray;
    var multiIndex = e.detail.value;
    var ztTime = multiArray[0][multiIndex[0]] + '-' + multiArray[1][multiIndex[1]] + '-' + multiArray[2][multiIndex[2]] + ' ' + multiArray[3][multiIndex[3]] + ':' + multiArray[4][multiIndex[4]];
    this.setData({
      multiIndex: e.detail.value,
      ztTime: ztTime
    })
  },
  bindMultiPickerColumnChange: function(e) { //修改后弃用
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  onShow: function(options) {
    this.getWXcode();
    wx.showLoading({
      title: '加载中',
    })
    order.getOrderInfo(
      this, {
        access_token: this.data.access_token,
        id: app.shopId
      }, {
        useMoney: this.data.useMoney,
        youhui: this.data.youhui
      },
      'cartTemp_zt'
    )
  },

  onReady: function(options) {},
  onPullDownRefresh: function() { //下拉刷新
    this.onShow();
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
  tapAddress: function(e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/address/index'
    })
  },
  nowPay(e) { //立即支付
    var that = this,
      skuids = this.data.skuids,
      pay_money = this.data.cartData.totalPrice,
      sendData = this.data.formData.detail.value;

    if (true) {
      var minit = '立即配送',
        cartData = this.data.cartData,
        ztTime = this.data.ztTime,
        reduction_id,
        vouchers_id;

      Number(this.data.reduction_id) > 0 ? reduction_id = this.data.reduction_id : reduction_id = '';
      Number(this.data.vouchers_id) > 0 ? vouchers_id = this.data.vouchers_id : vouchers_id = '';

      wx.request({
        url: app._host + "/index.php?ctrl=wxapp&action=createOrder&mainType=openZiti&access_token=" + this.data.access_token,
        method: 'POST',
        dataType: 'json',
        data: {
          shopid: app.shopId,
          remark: sendData.remark,
          minit: minit,
          peopleNum: sendData.peopleNum,
          cartData: cartData,
          reduction_id: reduction_id,
          vouchers_id: vouchers_id,
          types: skuids,
          tableNo: sendData.tableNo,
          orderFrom: 'zt',
          ztTime: ztTime,
          ztPhone: sendData.buyerphone,
          payFrom: e.detail.payMethod === 'balance' ? 'balance' : 'weChat'
        },
        success: function(res) {
          console.log('success' + res)
          if (res.statusCode != 200) {
            console.log('statusCode' + res)
            app.showToast("网络错误请重试", "fail");
            wx.redirectTo({
              url: '/pages/oList/index?otype=6',
            })
            wx.setStorageSync('cartTemp_zt', {});
            return;
          }
          var data = res.data;
          if (data.status) {
            if (e.detail.payMethod === 'weChat') {
              if (data.is_true_pay == 0) { //如果选择微信支付，支付金额为0就直接支付成功，跳转页面。
                wx.redirectTo({
                  url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
                })
                wx.setStorageSync('cartTemp_zt', {});
                wx.removeStorageSync('goodsType');
                wx.removeStorageSync('anewCart');
                return;
              }
              that.weChatPay(data, pay_money, reduction_id, vouchers_id, skuids) //微信支付
            } else {
              wx.redirectTo({
                url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
              })
              wx.setStorageSync('cartTemp_zt', {});
              wx.removeStorageSync('goodsType');
              wx.removeStorageSync('anewCart');
            }
          } else {
            wx.hideLoading();
            app.showToast(data.msg || '支付失败', "fail")
            if (data.code == 1) {
              wx.setStorageSync('cartTemp_zt', {});
              wx.removeStorageSync('goodsType'); //后期添加的
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
  weChatPay(data, pay_money, reduction_id, vouchers_id, skuids) {
    wx.requestPayment({
      'timeStamp': data.data.timeStamp,
      'nonceStr': data.data.nonceStr,
      'package': data.data.package,
      'signType': data.data.signType,
      'paySign': data.data.paySign,
      reduction_id: reduction_id,
      vouchers_id: vouchers_id,
      types: skuids,
      success: function(res) {
        wx.hideLoading();
      },
      fail: function(res) {
        console.log('fail' + res);
        wx.hideLoading();
        app.showToast("支付失败", "fail")
      },
      complete: function(res) {
        console.log('支付失败')
        console.log(res)
        wx.setStorageSync('cartTemp_zt', {});
        wx.removeStorageSync('goodsType');
        wx.removeStorageSync('anewCart');
        wx.redirectTo({
          url: '/pages/orderDetail/index?orderid=' + data.data.orderid + '&pay_money=' + pay_money
        })
      }
    })
  },
  tapPay: function(e) {
    if (this.data.pickerTimeRightIndex == null) {
      wx.showModal({
        title: '提示',
        content: '请选择取餐时间',
        showCancel: false
      })
      return;
    }
    //判断自提时间是否超过当前时间
    if (this.data.ztTime != '支付成功直接取餐') {
      var nowTime = new Date().getTime(),
        ztTime = new Date(`${this.data.ztTime}`).getTime();

      console.log(nowTime, ztTime)
      if (nowTime > ztTime) {
        wx.showModal({
          title: '提示',
          content: '请选择正确的自提时间',
          showCancel: false
        })
        return
      }
    }

    var reg = /^1\d{10}$/;
    if (!reg.test(e.detail.value.buyerphone)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的自提手机号',
        showCancel: false
      })
      return
    }
    // if (!e.detail.value.buyerphone) {app.showToast('请填自提手机号');return}
    if (!this.data.ztTime) {
      app.showToast('请填自提时间');
      return
    }

    this.setData({
      payment: {
        isShow: true,
        balance: this.data.userInfo.balance,
        payMoney: this.data.cartData.totalPrice,
      },
      formData: e
    })

  },
  tabredPacket: function() {
    var youhui = this.data.youhui;
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
  getPhoneNumber: function(e) {
    var that = this;
    app.getWXlogin(function() {
      that.getPhoneNumbers(e);
    })
  },
  getPhoneNumbers: function(e) {
    console.log(e)
    let that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //获取自提手机号
      var code = that.data.loginCode;
      let url = app._host + '/index.php?ctrl=wxapp&action=decryptUserData&access_token=' + wx.getStorageSync('access_token') + '&iv=' + encodeURIComponent(e.detail.iv) + '&encryptedData=' + encodeURIComponent(e.detail.encryptedData) + '&id=' + app.shopId + '&code=' + code
      wx.request({
        url: encodeURI(url),
        success: function(res) {
          if (!res.data.status) {
            app.showErrorModal(res.data.msg)
          } else {
            that.setData({
              mobile: res.data.data.phone
            })
          }
        },
        complete:function(){
          that.getWXcode();//每次发起请求都会获取此方法
        }
      })
    }
  },
  getWXcode(){
    //获取手机号
    let that =this;
    wx.login({
      success: function (res) {
        that.setData({
          loginCode: res.code
        })
      }
    })
  }
})