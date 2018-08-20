// pages/pay/pay.js
var app = getApp();
var API = require('../../utils/api.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isHidde: true, //上拉提升
        yyh: false,
        isHint: false,
        hintInfo: '',
        imgIndex: false,
        radioImg: 'images/radio.png',
        allNum: '', //总金额
        unSaleNum: '', //是否显示优惠金额
        isSaleInput: false, //是否显示不参加优惠金额
        isHidden: true, //是否提示
        payNum: '0.00', //支付金额
        checkedSaleInfo: {},
        initSaleTitle: '商家优惠券',
        shopname: null, //店铺名称
        template_style:'',
        coupon: [], //优惠券数组
        selected: -1, //选择优惠券
        couponNums: null, //是否优惠券
        isBgCc: true,
        isLoadIndex: true,
        isDisLong: false, //距离是否太远
        access_token: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        API.getFastTokenInfo(this).then((res) => {
            var data = res.data;
            console.log(data.data)
            if (data.status) {
              const { shopname, coupon, couponNums, isDisLong, template_style} = data.data;
              this.setData({ shopname, coupon, couponNums, isDisLong: false, template_style})
              var color='';
              if (this.data.template_style == "b") {
                color = "#31a6f6";
              } else if (this.data.template_style == "o") {
                color = "#ff8855";
              } else if (this.data.template_style == "y") {
                color = "#383838";
              } else if (this.data.template_style == "g") {
                color = "#383838";
              } else if (this.data.template_style == "r") {
                color = "#555555";
              } else if (this.data.template_style == "m") {
                color = "#000000";
              }
              console.log(color)
              wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: color
              })
            } else {
                app.showToast(data.msg)
            }
            this.setData({
                isLoadIndex: false
            })
        }, (err) => {
            this.setData({
                isLoadIndex: false
            })
            app.showToast('请求接口错误')
        });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
      wx.stopPullDownRefresh()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {},

    /**
     * 文本框输入赋值
     */
    bindInput(e) {
        var type = e.currentTarget.dataset.type;
        switch (type) {
            case 'all':
                this.setData({
                    allNum: e.detail.value
                });
                this.vailderAllNum('', () => {
                    var initSaleTitle = this.data.couponNums == 0 ? '没有可用优惠券' : '商家优惠券';
                    this.setData({
                        payNum: this.data.allNum,
                        initSaleTitle
                    })
                });
                break;
            case 'unsale':
                this.setData({
                    unSaleNum: e.detail.value
                });
                this.vailderAllNum('unSaleNum', () => {})
                break;
            default:
                break;
        }
    },
    showSaleInput() {

        this.vailderAllNum('', () => {
            this.setData({
                isSaleInput: true
            })
        })
    },
    vailderAllNum(type, cb) {
        if (type === 'unSaleNum') {
            if (!this.data.unSaleNum) {
                return;
            } else if (!(this.data.unSaleNum >= 0)) {
                this.showMessage('请输入正确不参与优惠的金额');
            } else if (Number(this.data.unSaleNum) > Number(this.data.allNum)) {
                this.showMessage('不参与优惠的金额不能超过消费总额');
                this.setData({
                    isBgCc: true,
                    payNum: '0.00',
                })
            } else {
                this.setData({
                    isBgCc: false,
                    payNum: this.data.allNum,
                })
                cb && cb();
            }
        } else {
            if (!this.data.allNum) {
                this.showMessage('消费总额不能为空')
                this.setData({
                    payNum: '0.00',
                    isBgCc: true,
                    isSaleInput: false,
                    unSaleNum: ''
                });
            } else if (!(this.data.allNum >= 0)) {
                this.showMessage('请输入正确金额');
                this.setData({
                    payNum: '0.00'
                });
            } else if (Number(this.data.allNum) > 10000) {
                this.showMessage('支付总额不能超过￥9999.99元');
                return;
            } else {
                this.setData({
                    isBgCc: false
                })
                cb && cb();
            }
        }
    },
    showMessage(txt) {
        if (this.data.isHidden) {
            this.setData({
                isHidden: false,
                hintInfo: txt,
            });
            setTimeout(() => {
                this.setData({
                    isHidden: true
                })
            }, 3000)
        }
    },
    validatePay() { //验证支付请求
        var reg = /^(-|\+)?\d+(\.\d+)?$/;
        if (!this.data.allNum) {
            this.showMessage('消费总额不能为空')
            this.setData({
                payNum: '0.00'
            });
            return;
        } else if (!(this.data.allNum > 0)) {
            this.showMessage('请输入正确金额');
            this.setData({
                payNum: '0.00',
                allNum: '',
            });
            return;
        } else if (Number(this.data.unSaleNum) > Number(this.data.allNum)) {
            this.showMessage('不参与优惠的金额不能超过消费总额');
            return;
        } else if (!Number(this.data.allNum) > 10000) {
            this.showMessage('支付总额不能超过￥9999.99元');
            return;
        }
        const modalConfig = {
            title: "提示",
            content: "确认转账付款吗？",
            cancelColor: "#1cad16",
            confirmColor: "#1cad16"
        }

        if (this.data.isDisLong) {
            modalConfig.content = '当前所选门店距离较远,是否继续买单？';
            API.showModal(modalConfig).then((res) => {
                this.sendPay();
            }, (err) => {
                // console.log('取消支付')
            })
        } else {
            API.showModal(modalConfig).then((res) => {
                this.sendPay();
            }, (err) => {
                // console.log('取消支付')
            })
        }
    },
    sendPay() { //发起支付
        var params = { access_token: this.data.access_token, shopid: app.shopId, allcost: this.data.payNum };
        API.fastPay(params).then((res) => {
            console.log(res);
            var data = res.data;
            if (data.status) {
                this.wechat(data.data);
            } else {
                app.showToast(data.msg);
            }
        }, (err) => {
            console.error(err);
            app.showToast('请求错误')
        })
    },
    wechat(params) { //调用微信支付
        API.wechatPay(params).then((res) => {
            app.isList = 1;
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, (err) => {
            app.showToast('已取消支付')
            // app.isList = 1;
            // wx.redirectTo({
            //     url: '/pages/index/index'
            // })
        })
    },
    radioChange(e) { //radioChange事件
        if (this.data.couponNums == 0) {
            return;
        }
        var selected = e.currentTarget.dataset.selected;
        if (selected == this.data.selected) { //点击本身取消选中
            this.setData({
                selected: -1,
                initSaleTitle: '商家优惠券'
            })
        } else {
            this.setData({
                selected,
                initSaleTitle: this.data.coupon[selected].name
            })
        }
    },
    showCoupon() { //展示优惠券
        this.setData({
            isHidde: false
        })
    },
    //关闭页面
    closeCoupon() {
        this.setData({
            isHidde: true,
        });
    },
})