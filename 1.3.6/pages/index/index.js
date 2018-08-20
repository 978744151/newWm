//index.js
//获取应用实例
var app = getApp(),
  AJAXFLAG = true;
var utils = require('../../utils/util.js');
var API = require('../../utils/api.js');
var zynetwork = require('../../zynetwork.js');
var zxlnetwork = require('../../zxlnetwork.js');
var color = '#31a6f6';
var shop_id;
Page({
  data: {
    messageContent: '',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    circular: true,
    vertical: true,
    img: [{
      thumb: 'https://pic.repaiapp.com/static/png/20171227/19/1514375368011185152.png'
    }, {
      thumb: 'https://pic.repaiapp.com/static/png/20171227/19/1514375368011185152.png'
    }, {
      thumb: 'https://pic.repaiapp.com/static/png/20171227/19/1514375368011185152.png'
    }],
    erweima: ['https://pic.repaiapp.com/static/jpg/20180817/11/1534476769893885099.jpg'],
      
    // sku data
    // upgrade:false,

    // hide98737:true,
    flagShow: false, //进行判断
    skuShow: false,
    isStatus: false,
    scrollHeight: 270,
    scrollHeightT: 270,
    selectedCate: {},
    fullstate: false,
    crFlag: 'm',
    shopInfo: {},
    goodsType: {},
    goodsMenu: {},
    shopDet: {},
    cartData: {
      'itemList': {},
      'totalPrice': 0.00,
      'totalBag': 0.00,
      'foodsNum': 0,
      'text': '去结算',
      'styleClass': 'pay',
      'display': 'none',
    },
    goodsCart: { //重新定义一个购物车
      'itemList': [],
      'totalPrice': 0.00,
      'totalBag': 0.00,
      'foodsNum': 0,
      'text': '去结算',
      'styleClass': 'pay',
      'display': 'none',
    },
    listIsEnd: false,
    listPage: 1,
    orderList: [],
    orderNum: 0,
    cpage: 0,
    isOpen: 1,
    timeArray: {},
    // animation: {},
    _goodstype: {},
    dialog: {
      flag: false,
      title: '',
      txt: '',
    },
    pscost: 0,
    isUpper: false,
    access_token: null,
    isMore: false,
    loadtxt: '刷新列表',
    event: null,
    dir: null,
    isLoadIndex: true,
    hiddenSacleDialog: true,
    curfood: {},
    animationData: {},
    couponShow: true,
    jShow: true,
    actiShow: false,
    autoplay: true,
    interval: 3000,
    scrollTop: 328,
    //tabbar以下参数
    //轮播图
    tel: '1515555555',
    imgUrls: [{
      image: 'https://pic.repaiapp.com/pic/88/29/5a/88295ae2d277a54aaa47873693a34fa4a3587cb1.png'
    }, {
      image: 'https://pic.repaiapp.com/pic/42/a9/bc/42a9bc7e61b430dd2ef8fc9c6bc34312ed9e04f4.png'
    }],
    indicatorDots1: true,
    autoplay1: true,
    interval1: 5000,
    duration1: 300,
    currentIndex: 0,
    idgroup: {
      iid: null,
      cateid: null
    },
    skuAttrname: '', //选择的规格与属性名称拼接
    skuId: '', //当前选择的规格的id
    isNewIndex: true,
    indexTemp: 1,
    isTabbar: false
  },
  upgradeOk: function() {
    this.setData({
      upgrade: false
    });
  },
  //by zxl 
  zxlindex: function() {
    var that = this;
    zxlnetwork.apiUrl({
      action: "shopIndex",
      id: app.shopId,
      lat: wx.getStorageSync("addressFlag").lat,
      lng: wx.getStorageSync("addressFlag").lng,
      version: app._version
    }, (res) => {
      console.log(res)
      if (res.status == true) {
        that.setData({
          z_data: res.data,
          acData: res.data.cxdata,
          indexTemp: res.data.indexPage,
          isLoadIndex: false
        })
        // this.intoShop();
        wx.setStorage({
          key: 'shopTheme',
          data: res.data.template,
        });
      } else {
        app.showToast(res.msg)
      }
    })
  },
  z_phone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },
  z_address: function(e) {
    wx.openLocation({
      latitude: Number(e.currentTarget.dataset.lat),
      longitude: Number(e.currentTarget.dataset.lng),
      name: e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
      success: function(res) {
        console.log(res)
      }
    })
  },
  onLoad: function(event) {
    wx.hideTabBar()
    var _that = this;
    _that.onLoads(event)
  },
  onLoads: function(event) {
    // app.getUser();
    app.editTabBar();
    var dir = wx.getStorageSync('dir') || {},
      isLocation = wx.getStorageSync('isLocation') || false,
      access_token = app._access_token || wx.getStorageSync('access_token'),
      tprice = "0.00",
      isUserInfo = wx.getStorageSync('isUserInfo') || false;
    if (event.hasOwnProperty('totalprice')) {
      tprice = event.totalprice;
    }
    this.setData({
      access_token,
      dir,
      event,
      totalprice: tprice
    });
    wx.getSystemInfo({
      success: res => {
        this.setData({
          height: Number(res.windowHeight) * 2 - 328 - 100,
        });
      }
    })
  },
  /**
   * 展示新首页 ypf 2018.1.23
   */
  showNewIndex() {
    //隐藏tabBar
    wx.hideTabBar({
      'aniamtion': false,
      'success': function(res) {
        console.log(res);
      },
      'fail': function(res) {
        console.log(res);
      }
    });

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    })

    wx.removeTabBarBadge({
      index: 1,
      success: function(res) {
        console.log(res);
      },
      fail: function() {
        console.log(res);
      }
    })
  },
  /**
   * 还原样式
   */
  initNewIndex(color) {
    //隐藏tabBar
    wx.showTabBar({
      'aniamtion': false,
      'success': function(res) {
        console.log(res);
      },
      'fail': function(res) {
        console.log(res);
      }
    });

    // console.log(this.data.color)
    var fc = color == '#ffffff' || color == '#fff' ? '#000000' : '#ffffff'
    wx.setNavigationBarColor({
      frontColor: fc,
      backgroundColor: color
    })

  },
  onShow: function() {
    var _that = this;
    app.getAccessToken(function() {
        app.getUserLocation(function () {
          _that.onShows();
        })
    });
    this.datas();
  },
  
  // 判断日期存储,红包显示
  datas: function() {
    //创建日期对象实例
    var day = new Date();
    var Year = day.getFullYear();
    var Month = (day.getMonth() + 1);
    var Day = day.getDate();
    
    // 日期补零
    if (Month >= 1 && Month <= 9) {
      Month = '0' + Month;
    }
    if (Day >= 0 && Day <= 9) {
      Day = '0' + Day;
    }

    var date = `${Year}-${Month}-${Day}`;

    //判断是否满足条件进入接口
    var storageDay = wx.getStorageSync('storageDay') || null
    
      if (storageDay) {
        if (date != storageDay) {
          
          this.intoShop();
          wx.setStorage({
            key: "storageDay",
            data: date
          })
        }
      } else {

        this.intoShop();
        wx.setStorage({
          key: "storageDay",
          data: date
        })
    }
  },
  onShows: function(e) {
    this.zxlindex();
    this.setData({
      upgrade: wx.getStorageSync('upgrade'),
      dir: wx.getStorageSync("addressFlag")|| {}
    });
    var _this = this;
    var access_token = wx.getStorageSync("access_token");
    var prams = {
      id: app.shopId,
      lat: wx.getStorageSync("addressFlag").lat,
      lng: wx.getStorageSync("addressFlag").lng,
      access_token: access_token,
      version: app._version
    }
    API.initShopInfo(prams).then((res) => {
      console.log(res)
      if (res.data.status == true) {
        _this.setData({
          z_data: res.data.data,
          acData: res.data.data.cxdata,
          indexTemp: res.data.data.indexPage,
          isLoadIndex: false
        })


        var shopTheme = res.data.data.template;
        wx.setStorage({
          key: 'shopTheme',
          data: shopTheme,
        });


        // 测试随机数
        var random = Math.floor(Math.random() * 10);
        if (random <= 5) {
          _this.setData({
            randomShow: 1
          });
        } else {
          _this.setData({
            randomShow: 2
          });
        }
        //根据接口返回重新赋值模板颜色
        _this.setData({
          crFlag: shopTheme
        })
        if (_this.data.crFlag == "b") {
          color = "#31a6f6";
        } else if (_this.data.crFlag == "o") {
          color = "#ff8855";
        } else if (_this.data.crFlag == "y") {
          color = "#383838";
        } else if (_this.data.crFlag == "g") {
          color = "#383838";
        } else if (_this.data.crFlag == "r") {
          color = "#555555";
        } else if (_this.data.crFlag == "m") {
          color = "#ffffff";
        }
        _this.setData({
          color
        });
        if (_this.data.color == '#ffffff') {
          wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: _this.data.color
          });
          wx.setStorage({
            key: 'color',
            data: '#000000'
          })
          wx.setStorage({
            key: 'ocolor',
            data: _this.data.color
          })
        } else {
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: _this.data.color
          })
          wx.setStorage({
            key: 'color',
            data: _this.data.color
          })
          wx.setStorage({
            key: 'ocolor',
            data: _this.data.color
          })
        }
        wx.setStorage({
          key: 'crFlag',
          data: _this.data.crFlag
        });
        if (res.data.data.indexPage == 2) {
          this.showNewIndex();
        } else {
          this.initNewIndex(color)
        }
        // }else{
        // this.showNewIndex();
        // }

      } else {
        app.showToast(res.data.msg)
      }

    }, (err) => {
      app.showToast('网络错误请重试')
    })

    if (!access_token) {
      _this.intoShop()
    }
    API.IndexData(this, this.data.event, this.data.dir, function (that) { })
  },
  // 活动页面
  activity: function() {
    var that = this;
    zynetwork.apiUrl('activity/queryValidActivity', {
      shop_id: app.shopId
    }, (res) => {
      if (res.status <= 0) {
        var actNum = 0;
        var data = res.data;
        for (var i in data) actNum++;
        if (data.reduction == '' && data.vouchers == '') actNum = 0;
        else if (data.reduction == '' || data.vouchers == '') actNum = actNum - 1;
        that.setData({
          actiStatus: res.status,
          actNum: actNum,
          vouchers: data.vouchers,
          reduction: data.reduction,
          acData: data
        })
      }
    });
  },
  shopDet: function() {
    wx.setStorage({
      key: "acData",
      data: this.data.acData
    });
  },
  //进店就送
  intoShop: function() {
    var that = this;
    zynetwork.apiUrl('activity/queryIsHasIntoVouchers', {
      shop_id: app.shopId
    }, (res) => {
      if (res.status <= 0) {
        that.setData({
          isStatus: false,
          status: res.status,
          intoCoupon: res.data,
          reduction_money: Number(res.data.reduction_money)
        })
      } else {
        that.setData({
          status: res.status,
          intoCoupon: res.data
        })
      }
    });
  },
  //进店就送去领取按钮
  accept: function() {
    var that = this;
    zynetwork.apiUrl('activity/givingVouchers', {
      shop_id: app.shopId,
      get_rule: 'into'
    }, (res) => {
      if (res.status <= 0) {
        wx.setStorage({
          key: "data",
          data: res.data
        });
        if (res.data.result.length > 0) {
         
          wx.navigateTo({
            url: '/pages/getCoupon/index'
          });
        }

      } else {

        utils.showMessage(this, '来晚一步，已被领取');
        that.setData({
          status: 1
        })
        
      }
    })
  },
  onHide() {
    this.setData({
      status: 1,
      cpage: 0
    })
    app.onHideIndex = true;
    if (app._access_token) {
      this.activity();
      // this.intoShop(); // 首次加载 

    }
  },
  goMap: function () {
    var lat = parseFloat(this.data.storelat);
    var lng = parseFloat(this.data.storelng);
    console.log(lat)
    console.log(lng)
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      name: this.data.address,
      address:  this.data.address,
      scale: 18
    })
  },
  onShareAppMessage: function() {
    return {
      title: '欢迎光临',
      path: '/pages/index/index',
      success: function(res) {
        app.showToast("转发成功", 'success')
      },
      fail: function(res) {
        app.showToast("转发失败")
      }
    }
  },
  anewCart: function() {},
  goCoupons: function(e) {
    var that = this;
    var time = e.timeStamp;
    if (time - app.globalData.lastTapTime < 500 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time; //这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    zynetwork.apiUrl('activity/givingVouchers', {
      shop_id: app.shopId
    }, (res) => {
      if (res.status <= 0) {
        that.setData({
          isStatus: false
        })
        wx.setStorage({
          key: "data",
          data: res.data
        });
        if (res.data.result.length > 0) {
          wx.navigateTo({
            url: '/pages/getCoupon/index'
          })
        }
      } else {
        wx.showToast({
          title: '来晚一步，已被领取',
          image: '/images/public/fail.png',
          duration: 2000
        })
        that.setData({
          isStatus: false
        })
      }
    })
  },
  close: function() {
    this.setData({
      isStatus: true,
      status: 100
    });
  },
  actiFuc: function() {
    this.setData({
      jShow: !this.data.jShow,
      actiShow: !this.data.actiShow
    })

  },
  tapMask: function(e) {
    var cartData = this.data.cartData;
    cartData.display = 'none';
    this.setData({
      cartData: cartData
    })
  },
  couponFuc: function(e) {
    var time = e.timeStamp;
    if (time - app.globalData.lastTapTime < 500 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time; //这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    wx.navigateTo({
      url: '/pages/coupon/coupon'
    })
  },
  goShop: function(e) {
    var shopId = e.currentTarget.dataset.shopid;
    console.log('----------商家Id start------------')
    console.log(shopId)
    wx.navigateTo({
      url: '/pages/shopDetail/index?shopId=' + shopId
    })
    console.log('----------商家Id end------------')
  },
  noticeOrder: function(e) { //拨打电话 || 催单
    console.log(e)
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone //仅为示例，并非真实的电话号码
    })
  },
  onPullDownRefresh: function() {
    this.zxlindex();
    this.onShow();
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  noOpenF: function() {
    // wx.showModal({
    //   title: '提示',
    //   content: "即将更新",
    //   showCancel: false
    // })
  },
  previewImage: function(e) { //全屏预览图片
    if (this.data.z_data.banners) {
      var current = e.target.dataset.src;
      wx.previewImage({
        current: current,
        urls: this.data.z_data.banners
      })
    }
  },
  previewImages: function (e) { //全屏预览图片
    var current = e.target.dataset.src;
    console.log(this.data.erweima)
    wx.previewImage({
      current: current,
      urls: this.data.erweima
    })
  }
})