/**
 * 未授权页面 nolocation
 * ypf 2017-05-25
 */

var app = getApp();
Page({
  data: {
    oauthCallback: '',
    nick_name: '',
    head_img: '',
    loginCode: ''
  },
  onLoad: function(options) {
    //获取店家名称
    this.getWXcode();
    this.getShopName();

    // console.log(options)
    //------------------ oauthCallback
    let currentPage = getCurrentPages(),
      router = currentPage[currentPage.length - 2],
      route = `/${router.route}`,
      param = '';

    if (JSON.stringify(router.options) != {}) { //对象转换陈URL参数
      for (let key in router.options) {
        param += `&${key}=${router.options[key]}`
      }
      param = param.replace(/&/, '?')
    }

    console.log(route, param)
    //------------------ 
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: wx.getStorageSync('color')
    });
    var oauthCallback = options.oauthCallback || 0;
    this.setData({
      url: route + param
    });
    //清除红包判断的本地存储
    wx.removeStorageSync('storageDay')
  },

  onShow: function() {
    var _isLocation = wx.getStorageSync('access_token'),
      _isUserInfo = wx.getStorageSync('isGetUserInfo');
    if (_isLocation && _isUserInfo) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },

  bindGetUserInfo: function(e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var that = this;
      var iv = encodeURIComponent(e.detail.iv);
      var enData = encodeURIComponent(e.detail.encryptedData);
      var token = wx.getStorageSync('access_token') || '';
      var code = that.data.loginCode;
      wx.request({
        method: 'POST',
        dataType: 'json',
        url: app._host + '/index.php?ctrl=wxapp&action=wxappUpdateUserInfo&access_token=' + token + '&code=' + code + '&id=' + app.shopId + "&type=new",
        data: {
          iv: iv,
          enData: enData
        },
        success: function(res) {
          console.log(res)
          if (res.statusCode === -100) {
            
          }
          if (res.statusCode != 200) {
            app.showErrorModal("数据错误请重试", '错误')
          }
          if (!res.data.status) {
            app.showToast(res.data.msg)
          } else {
            app.setCache('isGetUserInfo', 1);
            if (that.data.url) {
              // console.log('url',that.data.url)
              if (that.data.url.indexOf('/index/index') != -1) {
                wx.switchTab({
                  url: that.data.url,
                })
              } else {
                wx.redirectTo({
                  url: that.data.url
                })
              }
            } else {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        },
        fail: function(res) {
          _this.showToast("数据错误请重试")
        },
        complete: function() {}
      })
    }
  },
  //获取店家名称
  getShopName() {
    var that = this;
    wx.request({

      method: 'GET',
      url: app._host + '/index.php?ctrl=wxapp&action=shopIndex&type=getShopName&id=' + app.shopId,

      success: function(res) {

        console.log(res)

        if (res.data.data.nick_name) {
          that.nick_name = res.data.data.nick_name
        }
        if (res.data.data.head_img || 'http://wx.qlogo.cn/mmopen/qe519m1JtzOiaRcEDNGWIgpU3SWPcwuYEcSHDibaQkD5bic5MkM0LBuiaia9KrEvmVqXJRjrxWHVvZMN6fic9ISRGK2QfLL4CLUPf5/0') {
          that.head_img = res.data.data.head_img
        }
        that.setData({
          nick_name: that.nick_name,
          head_img: that.head_img
        })

      },
    })
  },
  getWXcode() {
    //获取手机号
    let that = this;
    wx.login({
      success: function(res) {
        that.setData({
          loginCode: res.code
        })
      }
    })
  }
})