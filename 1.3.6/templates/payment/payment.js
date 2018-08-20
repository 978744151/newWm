// pages/Component/payment/payment.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {
        isShow: false, //是否显示
        balance: '0', //用户余额
        payMoney: '0', //支付金额
      },
      observer: '_checkAmount'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isPayMethod: false, //是否显示选择支付方式
    payMethod: 'weChat', //选中的支付方式
    balancePay: false,
    noBalance: false, //余额是否充足
    howMuch: 0,
    click: 0,
    isMember: false, //不是会员
    isChecked: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _close: function() {
      this.setData({
        'data.isShow': false
      })
      this.triggerEvent('close')
    },
    _swithcPayType: function(e) { //切换支付方式
      if (e.currentTarget.dataset.paymethod == 'balance') {
        if (this.data.noBalance) {
          return;
        }
      }
      this.setData({
        payMethod: e.currentTarget.dataset.paymethod,
        isPayMethod: false
      })
    },
    nowPay: function() { //支付
    this.setData({
        isChecked:true
      })
      if (this.data.click == 0) {
        this.setData({
          click: 1
        })
        console.log('sfsafsf')
        var myEventDetail = {
          payMethod: this.data.payMethod
        } // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        setTimeout(() => {

          this.setData({
            click: 0,
          })
        }, 10000)

        this.triggerEvent('nowPay', myEventDetail, myEventOption);
      }

    },
    _jump(e) {
      console.log(app.has_card)
      if (app.has_card == '0') {
        wx.showModal({
          title: '提示',
          content: '请开通会员卡',
          showCancel: false,
          success: function() {
            wx.switchTab({
              url: '/pages/myVip/myVip',
            })
          }
        })
        return;
      }
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      })
    },
    _checkAmount: function(newVal, oldVal) { //校验金额
      let balance = parseFloat(newVal.balance)
      let payMoney = parseFloat(newVal.payMoney)
      console.log(balance, payMoney)
      if (isNaN(balance)) {
        this.setData({
          noBalance: true,
          payMethod: 'weChat',
          isMember: false
        })
        return;
      }
      if (payMoney > balance) {
        this.setData({
          noBalance: true,
          howMuch: (payMoney - balance).toFixed(2),
          payMethod: 'weChat',
          isMember: true,
        })
      } else {
        this.setData({
          noBalance: false,
          payMethod: 'balance',
          isMember: true
        })
      }
    },
  },
  created: function() {},
})