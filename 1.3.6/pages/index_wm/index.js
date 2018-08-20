//index.js
//获取应用实例
var app = getApp(),
  AJAXFLAG = true;
var utils = require('../../utils/util.js');
var API = require('../../utils/api.js');
var zynetwork = require('../../zynetwork.js');
// var pickDishes = require('../../utils/pickDishes.js');
import pickDishes from '../../utils/pickDishes.js'
var color = '#31a6f6';
var shop_id;
Page({
  data: {
    // sku data
    // upgrade:false,

    // hide98737:true,
    flagShow: false, //进行判断
    skuShow: false,
    isStatus: false,
    scrollHeight: null,
    scrollHeightT: 270,
    scrollHeightM: 960,
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
    skuId: '' //当前选择的规格的id
  },
  upgradeOk: function() {
    this.setData({
      upgrade: false
    });
  },
  // 页面加载
  onLoad: function(event) {
    app.islogin();
    app.editTabBar();
    var dir = wx.getStorageSync('dir') || {},
      isLocation = wx.getStorageSync('isLocation') || false,
      access_token = app._access_token || wx.getStorageSync('access_token'),
      isUserInfo = wx.getStorageSync('isUserInfo') || false;
    this.setData({
      access_token,
      dir,
      event,
      totalprice: event.totalprice
    });
    wx.getSystemInfo({
      success: res => {
        this.setData({
          height: Number(res.windowHeight) * 2 - 328 - 100,
        });
      }
    })
    shop_id = wx.getStorageSync('shop_id');
    this.intoShop();
  },
  // 页面展示
  onShow: function(e) {
    wx.setNavigationBarTitle({
      title: '外卖'
    });
    // console.log(this.data.goodsType)
    this.setData({
      upgrade: wx.getStorageSync('upgrade')
    });
    // 测试随机数
    var random = Math.floor(Math.random() * 10);
    if (random <= 5) {
      this.setData({
        randomShow: 1
      });
    } else {
      this.setData({
        randomShow: 2
      });
    }
    var shopTheme = wx.getStorageSync('shopTheme');
    //根据接口返回重新赋值模板颜色
    this.setData({
      crFlag: shopTheme
    })
    if (this.data.crFlag == "b") {
      color = "#31a6f6";
    } else if (this.data.crFlag == "o") {
      color = "#ff8855";
    } else if (this.data.crFlag == "y") {
      color = "#383838";
    } else if (this.data.crFlag == "g") {
      color = "#383838";
    } else if (this.data.crFlag == "r") {
      color = "#555555";
    } else if (this.data.crFlag == "m") {
      color = "#ffffff";
    }
    this.setData({
      color
    });
    if (this.data.color == '#ffffff') {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: this.data.color
      });
      wx.setStorage({
        key: 'color',
        data: '#000000'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: this.data.color
      })
      wx.setStorage({
        key: 'color',
        data: this.data.color
      })
    }
    wx.setStorage({
      key: 'crFlag',
      data: this.data.crFlag
    });
    this.activity();
    API.IndexData(this, this.data.event, this.data.dir, function(that) {
      // console.log(that.data.goodsType)
      var _isResh = app.isResh;
      var _cartData = wx.getStorageSync('cartTemp') || {};
      var _goodsType = wx.getStorageSync('goodsType');
      // 默认第一个被选中
      // var goodsIdArr=[];
      // for (var i in _goodsType) goodsIdArr.push(i)
      // _goodsType[goodsIdArr[0]].selected=1;
      if (app.isList == 1) {
        that.returnOrder();
      } else {
        console.log(`_isResh | ${_isResh}`)
        if (_isResh == 0) {
          if (utils.isEmpty(_cartData)) {
            // console.log('表示已经清空了购物车列表');
            _cartData = {
              'itemList': [],
              'totalPrice': 0.00,
              'totalBag': 0.00,
              'foodsNum': 0,
              'text': '去结算',
              'styleClass': 'pay',
              'display': 'none',
            };
            for (var type in _goodsType) {
              _goodsType[type].selectNum = 0;
            }
            that.setData({
              cartData: _cartData,
              goodsType: _goodsType
            })
          }
        }
      }
      try {
        var reduction = that.data.reduction;
        var actNum = that.data.actNum;
        var foodsNum = that.data.cartData.foodsNum;
        var num;
        var num2;
        if (actNum > 0) {
          num = 60;
        } else {
          num = 0;
        }
        if (reduction == '') {
          num2 = 0;
        } else if (reduction != '' && foodsNum > 0) {
          num2 = 50;
        } else {
          num2 = 0;
        }
        var res = wx.getSystemInfoSync();
          var scrollHeight = res.windowHeight - that.countPX(96) - that.countPX(68) - that.countPX(20)

          // var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - num - 88 + 1 - num2;

          var scrollHeightT = (Number(res.windowHeight) * 750 / res.windowWidth) - num - 88 + 1;
          if (app.scene == '1011') {
              scrollHeight = scrollHeight - that.countPX(90);
              scrollHeightT = scrollHeightT - 90;
          }
          that.setData({ scrollHeight: scrollHeight, scrollHeightT: scrollHeightT })
      } catch (e) {}
      console.log('onshow-selectedCate', that.data.cartData)
      console.log('onshow-goodsType', that.data.goodsType)
      var goodsTypeTemp = that.data.goodsTypeTemp;
      for (var i in that.data.cartData.itemList) {
        for (var j in goodsTypeTemp) {
          if (j == that.data.cartData.itemList[i].typeid) {
            goodsTypeTemp[j].selectNum += that.data.cartData.itemList[i].selectNum
          }
        }
      }
      that.setData({
        goodsType: goodsTypeTemp
      });
      var totalPrice = Number(that.data.cartData.totalPrice);
      that.addcart(totalPrice, that);
      that.showaddNum(that);
      that.numChange(that);
    }, 'openWaimai');
  },
  // 
    countPX: function (rpx) {        //rpx 转px
        var res = wx.getSystemInfoSync();
        return res.windowWidth / 750 * rpx;
    },
  //sku弹窗关闭事件
  skuclose: function() {
    this.setData({
      skuShow: false
    });
  },
  // 规格选择
  specChoose: function(e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.parentid
    });
    if (e.currentTarget.dataset.parentid == e.currentTarget.dataset.aindex) {
      this.setData({
        skuAttrname: this.data.skuAttr.types[e.currentTarget.dataset.aindex].name,
        skuprice: this.data.skuAttr.types[e.currentTarget.dataset.aindex].price,
        canhefei: this.data.skuAttr.types[e.currentTarget.dataset.aindex].additional,
        skuId: this.data.skuAttr.types[e.currentTarget.dataset.aindex].id,
        stockTemp: this.data.skuAttr.types[e.currentTarget.dataset.aindex].stock
      });
    }
    // console.log(this.data.canhefei)
    // console.log(this.data.skuId)
  },

  // 属性选择
  attrChoose: function(e) {
    var that = this;
    var skuAttr = that.data.skuAttr;
    var tagsId = '';
    for (var i in skuAttr.tags) {
      if (e.currentTarget.dataset.parentid == i) {
        for (var j = 0; j < skuAttr.tags[i].length; j++) {
          skuAttr.tags[i][j].state = 0;
        }
        skuAttr.tags[e.currentTarget.dataset.parentid][e.currentTarget.dataset.aindex].state = 1;
      }
    }
    for (var i = 0; i < skuAttr.tags.length; i++) {
      for (var j = 0; j < skuAttr.tags[i].length; j++) {
        if (skuAttr.tags[i][j].state == 1) {
          tagsId += skuAttr.tags[i][j].id + ',';
        }
      }
    }
    tagsId = tagsId.substr(0, tagsId.lastIndexOf(','))
    // console.log(tagsId)
    that.setData({
      skuAttr: skuAttr,
      tagsId
    });
  },
  // 选规格事件--弹出规格框
  showSkuHandle: function(e) {
    var goodsCart = {
      'itemList': [],
      'totalPrice': 0.00,
      'totalBag': 0.00,
      'foodsNum': 0,
      'text': '去结算',
      'styleClass': 'pay',
      'display': 'none',
    }
    if (this.data.cartData.itemList.length == 0) {
      this.setData({
        goodsCart
      });
    }
    var foodId = e.currentTarget.dataset.iid;
    var menuId = e.currentTarget.dataset.cateid;
    var curfood = this.data._goodstype[menuId].det[foodId];
    var skuprice; //规格中对应的价格
    var canhefei; //规格中对应的餐盒费
    var skuId; //规格id
    var tagsId = ''; //属性id
    var stockTemp = ''; //规格下面的库存
    for (var i in curfood.types) {
      curfood.types[i].parentid = i;
      skuprice = curfood.types[0].price; //价格
      canhefei = curfood.types[0].additional; //餐盒费
      skuId = curfood.types[0].id; //规格id
      stockTemp = curfood.types[0].stock; //规格下面的库存
    }
    if (curfood.tags.length > 0) {
      for (var j in curfood.tags) {
        for (var i = 0; i < curfood.tags[j].length; i++) {
          curfood.tags[j][i].state = 0;
          curfood.tags[j][0].state = 1;
        }
        for (var i = 0; i < curfood.tags[j].length; i++) {
          if (curfood.tags[j][i].state == 1) {
            tagsId += curfood.tags[j][i].id + ',';
          }
        }
      }
    }
    console.log('商品的属性下面的id组装')
    tagsId = tagsId.substr(0, tagsId.lastIndexOf(','))
    // console.log(tagsId)
    // console.log('点击带有规格的商品的当前商品信息---curfood')
    // console.log(curfood)
    this.setData({
      stockTemp: stockTemp,
      skuId: skuId,
      tagsId,
      canhefei: canhefei,
      skuprice: skuprice,
      idgroup: {
        iid: e.currentTarget.dataset.iid,
        cateid: e.currentTarget.dataset.cateid
      },
      skuAttr: curfood,
      skuShow: true
    });
    // 关闭图片放大的弹窗
    this.closeSacleDialog();
  },
  /**规格中减商品 */
  skuMinus: function() {
    this.setData({
      shide: true,
      hide98737: false
    })
    // wx.showToast({
    //     title: '多规格商品只能去购物车删除哦',
    //     image: '/images/public/fail.png',
    //     duration: 2000
    // })

    wx.showModal({
      title: '提示',
      content: '多规格商品只能去购物车删除哦',
      showCancel: false
    })
  },
  //   选好了加入购物车(加入购物车)
  selectOk: function() {
    var skuAttrname = this.data.skuAttrname;
    var skuAttr = this.data.skuAttr; //点击的当前商品
    var skuId = this.data.skuId; //规格id
    var stockTemp = this.data.stockTemp //库存
    if (skuAttr.tags.length > 0) {
      for (var i = 0; i < skuAttr.tags.length; i++) {
        for (var j = 0; j < skuAttr.tags[i].length; j++) {
          if (skuAttr.tags[i][j].state == 1) {
            if (skuAttrname == '') {
              skuAttrname = skuAttr.types[0].name += ('/' + skuAttr.tags[i][j].name);
            } else {
              skuAttrname += ('/' + skuAttr.tags[i][j].name);
            }
          }
        }
      }
    } else {
      if (skuAttrname == '') {
        skuAttrname = skuAttr.types[0].name
      }
      skuAttrname;
    }
    this.setData({
      moneyShow: true,
      skuShow: false
    })
    var thisId = this.data.idgroup.iid; //单商品的id
    var thisCid = this.data.idgroup.cateid; //进行匹配筛选左侧菜单下面的所有商品
    var goodsType = this.data.goodsType; // 右侧菜单所有的商品
    var thisCateData = goodsType[thisCid]; //左侧菜单对应的所有商品列表
    // console.log(thisCateData)
    var thisData = thisCateData.det[thisId]; //单个商品的id
    var fl = 0; //判断是否走for循环
    thisData.cost = this.data.skuprice; //规格的价格
    thisData.bagcost = this.data.canhefei; //规格中的餐盒费用
    thisData.skuAttrname = skuAttrname; //追加选择的属性
    thisData.stockTemp = stockTemp;
    // console.log(thisData)
    if (thisData.stockTemp <= 0) {
      wx.showToast({
        title: '商品库存不足',
        image: '/images/public/fail.png',
        duration: 3000
      })
      return;
    }
    thisData.type_id = skuId; //追加选择的id
    thisData.tag_id = this.data.tagsId;
    if (JSON.stringify(this.data.cartData.itemList) == '{}' || this.data.cartData.itemList.length == 0) {
      var goodsCart = this.data.goodsCart;
    } else {
      var goodsCart = this.data.cartData
    }
    var limitcost = this.data.shopDet.limitcost;
    app.isResh = 1; //重新加载 指零
    var _anewCart = wx.setStorageSync('anewCart', {}); //添加或减少 将anewCart清空
    ++goodsCart.foodsNum;
    ++thisCateData.selectNum;
    goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) + Number(thisData.cost)).toFixed(2));
    if (Number(thisData.bagcost) > 0) {
      goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) + Number(thisData.bagcost)).toFixed(2));
      goodsCart.totalBag = Number((Number(goodsCart.totalBag) + Number(thisData.bagcost)).toFixed(2));
    }
    if (Number(goodsCart.totalPrice) < limitcost) {
      goodsCart.text = '还差￥' + Number(limitcost - goodsCart.totalPrice).toFixed(0) + '起送';
    } else {
      goodsCart.text = '去结算';
    }
    /**这边判断购物车商品列表是否存在当前你点击的商品 */
    if (goodsCart.itemList.length == 0) {
      ++thisData.selectNum;
      thisData.countPrice = Number((thisData.selectNum * Number(thisData.cost)).toFixed(2));
      goodsCart.itemList.push(JSON.parse(JSON.stringify(thisData)));

    } else {
      for (var i = 0; i < goodsCart.itemList.length; i++) {
        if (thisData.id == goodsCart.itemList[i].id && thisData.type_id == goodsCart.itemList[i].type_id && thisData.tag_id == goodsCart.itemList[i].tag_id) {
          fl = 1;
          ++goodsCart.itemList[i].selectNum;
          goodsCart.itemList[i].countPrice = Number((goodsCart.itemList[i].selectNum * Number(thisData.cost)).toFixed(2));
        }
      }
      if (fl == 0) {
        thisData.selectNum = 0;
        ++thisData.selectNum;
        thisData.countPrice = Number((thisData.selectNum * Number(thisData.cost)).toFixed(2));
        goodsCart.itemList.push(JSON.parse(JSON.stringify(thisData)));
      }
    }
    try {
      wx.setStorageSync('cartTemp', goodsCart);
      wx.setStorageSync('goodsType', goodsType);
      this.setData({
        cartData: goodsCart,
        goodsType: goodsType,
      })
      this.closeSacleDialog();
    } catch (e) {
      console.log('加入购物车失败');
    }
    var totalPrice = Number(this.data.cartData.totalPrice);
    this.addcart(totalPrice, this)
    // console.log('当前的商品信息', thisData)
    // console.log('购物车', this.data.cartData)
    // console.log('右侧', thisCateData)
    //显示已添加商品的数量
    this.showaddNum(this);
    // //    已满高度计算
    this.heigtAuto(this);
    this.numChange(this);
    this.setData({
      currentIndex: 0,
      skuAttrname: ''
    });
    console.log('购物车的商品列表---cartData')
    console.log(this.data.cartData)
  },
  //联系客服
  calling: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.tel, //此号码并非真实电话号码，仅用于测试
    })
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
        var hasReduction = false
        if (data.reduction != '') hasReduction = true;
        for (var i in data) actNum++;
        if (data.reduction == '' && data.vouchers == '') actNum = 0;
        else if (data.reduction == '' || data.vouchers == '') actNum = actNum - 1;
        that.setData({
          hasReduction: hasReduction,
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
      // console.log(res)
      if (res.status <= 0) {
        that.setData({
          isStatus: true,
          status: 100,
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
        wx.showToast({
          title: '来晚啦已被领取',
          image: '/images/public/fail.png',
          duration: 2000
        })
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
    this.activity();
    this.intoShop();
  },
  // 分享
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
  // 外面左侧边栏选择
  tapCate: function(e) {
    // console.log(e)
    var thisId = e.currentTarget.dataset.cateid;
    var goodsType = this.data.goodsType;
    for (var k in goodsType) {
      goodsType[k].selected = 0;
      if (k == thisId) {
        goodsType[k].selected = 1
      }
    }
    var selectedCate = goodsType[thisId];
    var itemselectedCate = JSON.parse(JSON.stringify(utils.sortByField(goodsType[thisId].det, 'good_order')));
    // console.log('itemselectedCate', itemselectedCate)
    this.setData({
      goodsType: goodsType,
      selectedCate: selectedCate,
      selectedCateItem: itemselectedCate
    })
    this.showaddNum(this)
    // console.log('点击左侧的菜单栏显示当前栏目下的所有商品--selectedCate')
    console.log(this.data.selectedCate)
  },
  // 去领取
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

  /**
   * 高度自适应
   *
   */
  heightAuto(that) {
    var foodsNum = that.data.cartData.foodsNum;
    var reduction = that.data.reduction;
    var actNum = that.data.actNum;
    var num;
    var num2;
    if (actNum > 0) {
      num = 60;
    } else {
      num = 0;
    }
    if (reduction == '') {
      num2 = 0;
    } else if (reduction != '' && foodsNum > 0) {
      num2 = 50;
    } else {
      num2 = 0;
    }
    var res = wx.getSystemInfoSync();
    // var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - num - 88 + 1 - num2;
    // that.setData({
    //   scrollHeight: scrollHeight,
    // })
  },
  // 打开购物车列表
  tapCartList: function(e) {
    // console.log(e)
    var cartData = this.data.cartData;
    console.log(cartData)
    cartData.display = (cartData.display == "block" || cartData.foodsNum == 0) ? 'none' : 'block';
    this.translate();
    this.setData({
      cartData: cartData
    })
  },
  // 点击空白部分
  tapMask: function(e) {
    var cartData = this.data.cartData;
    cartData.display = 'none';
    this.setData({
      cartData: cartData
    })
  },
  //清空购物车
  tapEmptyCart: function(e) {
    var that = this;
    setTimeout(function() {
      var foodsNum = that.data.cartData.foodsNum;
      var reduction = that.data.reduction;
      var actNum = that.data.actNum;
      var num;
      var num2;
      if (actNum > 0) {
        num = 60;
      } else {
        num = 0;
      }
      if (reduction) {
        num2 = 0;
      }
      var res = wx.getSystemInfoSync();
    //   var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - num - 88 + 1 - num2;
    //   that.setData({
    //     scrollHeight: scrollHeight,
    //   })
    }, 300);
    wx.showModal({
      title: '确认清空购物车',
      content: '',
      confirmText: "清空",
      cancelText: "取消",
      confirmColor: '#2297e5',
      success: function(res) {
        if (res.confirm) {
          for (var i in that.data.selectedCate.det) {
            that.data.selectedCate.det[i].selectNum = 0;
          }
          that.setData({
            selectedCate: that.data.selectedCate
          })
          wx.setStorageSync('anewCart', {});
          // API.getIndexData(that, that.data.event, that.data.dir);
          var cartData = that.data.cartData;
          var goodsType = that.data.goodsType;
          var limitcost = Number(that.data.shopDet.limitcost);
          for (var k in goodsType) {
            goodsType[k].selectNum = 0;
            var detInfo = goodsType[k].det;
            for (var j in detInfo) {
              detInfo[j].selectNum = 0;
            }
          }
          cartData.itemList = [];
          cartData.totalPrice = 0.00;
          cartData.totalBag = 0.00;
          cartData.foodsNum = 0;
          cartData.text = limitcost > 0 ? "还差￥" + limitcost + "起送" : "去结算";
          cartData.styleClass = 'pay';
          cartData.display = 'none';
          console.log(goodsType)
          try {
            wx.setStorageSync('cartTemp', cartData);
            wx.setStorageSync('goodsType', that.data._goodsType);
            wx.setStorageSync('anewCart', {});
            that.setData({
              cartData,
              goodsType
            })
          } catch (e) {
            console.log('加入购物车失败');
          }
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
  },
  tapPay: function(e) {
    pickDishes.tapPay(this, 'createOrder')
    return;
    // if (this.data.shopInfo.is_open == '0') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '小店打烊啦,非常抱歉给您带来不便',
    //     showCancel: false
    //   })
    //   return;
    // }

    // console.log('----------去结算  拼接skuId----------')
    // var itemList = this.data.cartData.itemList
    // var skuids = '';
    // for (var i in itemList) {
    //   if (itemList[i].skuId) {
    //     skuids += itemList[i].skuId + ','
    //   }
    // }
    // skuids = skuids.substr(0, skuids.lastIndexOf(','))
    // console.log(skuids)
    // //youhui ==满减的钱
    // var youhui;
    // if (this.data.youhui > 0) {
    //   youhui = this.data.youhui
    // } else {
    //   youhui = 0;
    // }
    // var reduction_id = this.data.reduction_id;
    // var reduction_id;
    // if (reduction_id > 0) {
    //   reduction_id = this.data.reduction_id;
    // } else {
    //   reduction_id = '';
    // }
    // console.log(reduction_id)
    // var hasReduction = this.data.hasReduction;
    // var totalPrice = Number(this.data.cartData.totalPrice);
    // if (this.data.cartData.totalPrice < this.data.shopDet.limitcost || this.data.cartData.totalPrice < 0 || !(this.data.cartData.foodsNum > 0)) {
    //   return;
    // } else {
    //   zynetwork.apiUrl('activity/getValidVouchersByPayMoney', {
    //     pay_money: totalPrice
    //   }, (res) => {
    //     if (res.status <= 0) {
    //       wx.setStorage({
    //         key: "usableData",
    //         data: res.data
    //       });
    //     }
    //     wx.navigateTo({
    //       url: '/pages/createOrder/index?youhui=' + youhui + '&reduction_id=' + reduction_id + '&skuids=' + skuids + '&hasReduction=' + hasReduction
    //     })
    //   });
    // }

  },
  // 跳到优惠卷
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
  viewChange: function(e) {
    if (e.detail.current == 0) {
      this.setData({
        cpage: 0
      })
      return;
    } else if (e.detail.current == 1) {
      this.setData({
        cpage: 1
      })
      return;
    }
    // else if (e.detail.current == 2) {
    //     wx.navigateTo({
    //         url: '/pages/coupon/coupon'
    //     })
    //     return;
    // }
    this.getOrderList();
  },
  // 加载更多
  loadMoreList: function(e) {
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
          access_token
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
  changePage: function(e) {
    var page = e.currentTarget.dataset.page;
    console.log(page)
    this.setData({
      cpage: page
    })
  },
  /**
   * couponFuc:function (e) {  点击菜单优惠券 跳转的页面
    var time = e.timeStamp;
    if (time - app.globalData.lastTapTime < 500 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time;//这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    wx.navigateTo({
      url: '/pages/coupon/coupon'
    })
  },
   */

  goShop: function(e) {
    var shopId = e.currentTarget.dataset.shopid;
    console.log('----------商家Id start------------')
    console.log(shopId)
    wx.navigateTo({
      url: '/pages/shopDetail/index?shopId=' + shopId
    })
    console.log('----------商家Id end------------')
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
  cancelOrder: function(e) {
    var orderid = e.currentTarget.dataset.orderid,
      that = this;
    API.moduleCancelOrder(this, orderid).then((res) => {
      app.isList = 1; //刷新列表
      that.returnOrder();
    }, (err) => {
      app.showToast('取消订单失败');
    })
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
    wx.reLaunch({
      url: '/pages/index/index?orderid=' + orderid + '&totalprice=' + totalprice
    })
    console.log('再来一点的时候获取 _orderList[index]', _orderList[index])
    console.log('再来一点的时候获取的列表', _orderList[index].listdet)
  },
  gopay: function(e) { //去支付
    var that = this;
    API.moduleGoPay(this, e).then((res) => {
      app.showToast("支付成功", "success");
      that.getOrderList();
    }, (res) => {
      app.showToast("支付失败");
    });
  },
  confirmOrder: function(e) { //确认送达
    var access_token = app._access_token || wx.getStorageSync('access_token');
    if (AJAXFLAG) {
      AJAXFLAG = false;
      var orderid = e.currentTarget.dataset.orderid;
      var that = this;
      wx.request({
        url: app._host + "/index.php?ctrl=wxapp&action=confirmOrder&access_token=" + access_token,
        method: 'GET',
        dataType: 'json',
        data: {
          orderid: orderid
        },
        success: function(res) {
          AJAXFLAG = true;
          that.getOrderList();
        },
        fail: function(res) {
          app.showToast(res);
        },
        complete: function(res) {
          wx.hideLoading()
        }
      })
    }
  },
  anewCart: function() { //再来一单重新添加本地缓存
    var _anewCart = wx.getStorageSync('anewCart') || {},
      _goodsType = this.data.goodsType,
      limitcost = this.data.shopDet.limitcost,
      // 创建itemList数组
      _cartTemp = {
        'itemList': [],
        'totalPrice': 0.00,
        'totalBag': 0.00,
        'foodsNum': 0,
        'text': '去结算',
        'styleClass': 'pay',
        'display': 'block',
      },
      allMoney = 0, //购物车的总价格
      goodsNum = 0, //购物车显示的数目
      goodscost = 0,
      bagMoney = 0; //购物车显示的打包费

    console.log('获取的再来一单商品列表信息', _anewCart);
    console.log('获取的再来商品信息', _goodsType);

    //1.再来一单的商品列表
    console.log('goods_type', _goodsType);

    for (var i in _anewCart) {
      //得到当前返回商品的详情
      var info = _anewCart[i];
      console.log('info', info);
      //得到对应所有商品列表的详细信息
      var goodsInfo = _goodsType[info.typeid].det[info.goodsid]
      console.log('goodsInfo_start', goodsInfo);

      goodsInfo.type_id = info.type_id;
      goodsInfo.tag_id = info.tag_id;
      goodsInfo.selectNum = Number(info.goodscount);
      goodsInfo.skuAttrname = '';
      console.log('goodsInfo_one', goodsInfo);
      //判断是否有规格
      if (goodsInfo.has_type) {
        console.log('goodsType', goodsInfo.types);
        //获取规格信息
        for (var t in goodsInfo.types) {
          //设置临时规格信息变量
          var goodsType = goodsInfo.types[t];
          if (info.type_id == goodsType.id) {
            //设置必要属性
            goodsInfo.cost = goodsType.price;
            goodsInfo.bagcost = goodsType.additional;
            goodsInfo.skuAttrname += goodsType.name;
          }
        }
        //获取属性信息 如果返回的再来一单商品信息中包含属性ID
        if (info.tag_id && goodsInfo.tags) {
          //切割返回的tag_id
          var tags = info.tag_id.split(',');
          console.log('det_tags', tags);
          //循环已有的数组
          for (var tag_index in tags) {
            for (var goods_tag_index in goodsInfo.tags) {
              for (var tag_detail_index in goodsInfo.tags[goods_tag_index]) {
                if (tags[tag_index] == goodsInfo.tags[goods_tag_index][tag_detail_index].id) {
                  if (goodsInfo.skuAttrname) {
                    goodsInfo.skuAttrname += '/' + goodsInfo.tags[goods_tag_index][tag_detail_index].name;
                  } else {
                    goodsInfo.skuAttrname += goodsInfo.tags[goods_tag_index][tag_detail_index].name;
                  }
                }
              }
            }
          }
        }
      }
      /**
       * JSON.parse(JSON.stringify(goodsInfo));
       * 这种格式的写法为了避免循环时候永远都是推的最后一个进数组中
       */
      _cartTemp.totalBag += Number(info.goodscount) * goodsInfo.bagcost;
      _cartTemp.foodsNum += Number(info.goodscount);
      _cartTemp.totalPrice += Number(info.goodscount) * goodsInfo.cost + Number(info.goodscount) * goodsInfo.bagcost;
      _goodsType[info.typeid].det[info.goodsid] = JSON.parse(JSON.stringify(goodsInfo));
      _cartTemp.itemList.push(JSON.parse(JSON.stringify(goodsInfo)));
      _goodsType[info.typeid].selectNum += Number(info.goodscount)
    }
    this.setData({
      cartData: _cartTemp,
      goodsType: _goodsType
    })
    wx.setStorageSync('cartTemp', _cartTemp);
  },
  translate: function() { //购物车动画
    // this.animate().translateY(100).export();
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    });
    this.animation = animation
    animation.translateY(100).step()
    this.setData({
      animation: animation.export()
    })
  },
  getOrderList: function() { //获取订单列表????
    // console.log('getOrderList')
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
          access_token
        },
        success: function(res) {
          console.log(res)
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
  returnOrder: function() { //返回主页重新获取订单列表 isList制0
    console.log('------------isList-----------------')
    console.log(app.isList)
    console.log('------------isList-----------------')
    if (app.isList == 1) {
      this.getOrderList();
      app.isList = 0;

    }
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
  closeDialog: function() {
    var _dialog = this.data.dialog;
    _dialog.flag = false;
    this.setData({
      dialog: _dialog
    })
  },
  noticeOrder: function(e) { //拨打电话 || 催单
    console.log(e)
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone //仅为示例，并非真实的电话号码
    })
  },
  onPullDownRefresh: function() {
    // API.getIndexData(this, this.data.event, this.data.dir);
    // this.activity();
    // this.intoShop();
    // this.getOrderList();
    API.IndexData(this, this.data.event, this.data.dir, function(that) {
      var goodsTypeTemp = that.data.goodsTypeTemp;
      for (var i in that.data.cartData.itemList) {
        for (var j in goodsTypeTemp) {
          if (j == that.data.cartData.itemList[i].typeid) {
            goodsTypeTemp[j].selectNum += that.data.cartData.itemList[i].selectNum
          }
        }
      }
      that.setData({
        goodsType: goodsTypeTemp
      });
      console.log('onPullDownRefresh-that.data.goodsType', that.data.goodsType)
      that.showaddNum(that);
      that.activity();
      that.intoShop();
    }, 'openWaimai')
    //this.getOrderList();
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  topOrderInfo: function(e) {
    var orderid = e.currentTarget.dataset.orderid;
    var type = e.currentTarget.dataset.type;
    if (type == 5) {
      return;
    }
    wx.navigateTo({
      url: '/pages/orderDetail/index?orderid=' + orderid
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
        }, 3000)
      }
    }
  },
  showScaleDialog(e) { //放大弹窗
    var foodId = e.currentTarget.dataset.iid;
    var menuId = e.currentTarget.dataset.cateid;
    var curfood = this.data._goodstype[menuId].det[foodId];
    console.log(foodId)
    console.log(menuId)
    console.log(curfood)
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation;
    animation.scale(1, 1).step();
    this.setData({
      curfood,
      crFlag: this.data.crFlag,
      hiddenSacleDialog: false,
      animationData: animation.export()
    })
  },
  closeSacleDialog() {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation;
    animation.scale(.3, .3).step()
    this.setData({
      animationData: animation.export(),
      hiddenSacleDialog: true
    })
  },
  gotransfer: function() {
    wx.navigateTo({
      url: '/pages/pay/pay'
    })
  },
  // 购物车列表的添加减少
  cartAdd: function(e) {
    console.log(e)
    /**
     * 反之多重点击
     */
    var time = e.timeStamp;
    if (time - app.globalData.lastTapTime < 300 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time; //这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;

    var thisCid = e.currentTarget.dataset.cateid;
    var goodsType = this.data.goodsType;
    var thisCateData = goodsType[thisCid];
    // console.log('goodsType', goodsType)
    // console.log('thisCateData', thisCateData)
    var limitcost = this.data.shopDet.limitcost;
    console.log(this.data.cartData.itemList);
    for (var i = 0; i < this.data.cartData.itemList.length; i++) {
      if (
        this.data.cartData.itemList[i].id == e.currentTarget.dataset.iid &&
        this.data.cartData.itemList[i].type_id == e.currentTarget.dataset.type_id &&
        this.data.cartData.itemList[i].tag_id == e.currentTarget.dataset.tag_id
      ) {
        if (e.currentTarget.dataset.zy == 0) {
          if (--this.data.cartData.foodsNum <= 0) {
            this.data.cartData.foodsNum = 0;
            this.data.cartData.display = 'none';
          }
          if (--thisCateData.selectNum <= 0) {
            thisCateData.selectNum = 0;
          }
          if (--this.data.cartData.itemList[i].selectNum <= 0) {
            this.data.cartData.itemList[i].selectNum = 0;
          }
          this.data.cartData.totalPrice = Number((Number(this.data.cartData.totalPrice) - Number(this.data.cartData.itemList[i].cost)).toFixed(2));
        } else {
          ++this.data.cartData.foodsNum;
          ++thisCateData.selectNum;
          this.data.cartData.totalPrice = Number((Number(this.data.cartData.totalPrice) + Number(this.data.cartData.itemList[i].cost)).toFixed(2));
          ++this.data.cartData.itemList[i].selectNum
        }
        if (Number(this.data.cartData.itemList[i].bagcost) > 0) {
          if (e.currentTarget.dataset.zy == 1) {
            this.data.cartData.totalPrice = Number((Number(this.data.cartData.totalPrice) + Number(this.data.cartData.itemList[i].bagcost)).toFixed(2));
            this.data.cartData.totalBag = Number((Number(this.data.cartData.totalBag) + Number(this.data.cartData.itemList[i].bagcost)).toFixed(2));
          } else {
            this.data.cartData.totalPrice = Number((Number(this.data.cartData.totalPrice) - Number(this.data.cartData.itemList[i].bagcost)).toFixed(2));
            this.data.cartData.totalBag = Number((Number(this.data.cartData.totalBag) - Number(this.data.cartData.itemList[i].bagcost)).toFixed(2));
          }
        }
        if (Number(this.data.cartData.totalPrice) < limitcost) {
          this.data.cartData.text = '还差￥' + Number(limitcost - this.data.cartData.totalPrice).toFixed(0) + '起送';
        } else {
          this.data.cartData.text = '去结算';
        }
      }
    }
    this.setData({
      cartData: this.data.cartData,
      goodsType: goodsType
    });
    wx.setStorageSync('cartTemp', this.data.cartData);
    wx.setStorageSync('goodsType', goodsType);

    var totalPrice = Number(this.data.cartData.totalPrice);
    if (e.currentTarget.dataset.zy == 1) {
      this.addcart(totalPrice, this)
      this.heigtAuto(this);
    } else {
      this.addcart(totalPrice, this)
      this.minusHeight(this)
    }
    console.log("右侧内容", thisCateData)
    console.log("购物车内容", this.data.cartData)

    //显示已添加商品的数量
    this.showaddNum(this);
    this.numChange(this);
  },
  //   商品列表添加减少
  listAdd: function(e) {
    /**
     * 反之多重点击
     */
    var time = e.timeStamp;
    if (time - app.globalData.lastTapTime < 300 && app.globalData.lastTapTime != 0) {
      app.globalData.lastTapTime = time; //这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;

    var goodsCart = {
      'itemList': [],
      'totalPrice': 0.00,
      'totalBag': 0.00,
      'foodsNum': 0,
      'text': '去结算',
      'styleClass': 'pay',
      'display': 'none',
    }
    if (this.data.cartData.itemList.length == 0) {
      this.setData({
        goodsCart
      });
    }
    var thisId = e.currentTarget.dataset.iid; //单商品的id
    var thisCid = e.currentTarget.dataset.cateid; //进行匹配筛选左侧菜单下面的所有商品
    var goodsType = this.data.goodsType; // 右侧菜单所有的商品
    var thisCateData = goodsType[thisCid]; //左侧菜单对应的所有商品列表
    var fl = 0; //判断是否走for循环
    var thisData = thisCateData.det[thisId]; //单个商品的id
    console.log(thisData)
    if (thisData.count <= 0) {
      wx.showToast({
        title: '商品库存不足',
        image: "/images/public/fail.png",
        duration: 2000
      })
      return;
    }
    // console.log(this.data)
    console.log(this.data.goodsCart)
    console.log(this.data.cartData)
    if (JSON.stringify(this.data.cartData.itemList) == '{}' || this.data.cartData.itemList.length == 0) {
      var goodsCart = this.data.goodsCart;
    } else {
      var goodsCart = this.data.cartData
    }
    var limitcost = this.data.shopDet.limitcost;
    app.isResh = 1; //重新加载 指零
    var _anewCart = wx.setStorageSync('anewCart', {}); //添加或减少 将anewCart清空
    if (!thisData.skuAttrname) {
      thisData.skuAttrname = '';
    }
    if (e.currentTarget.dataset.zy == 1) {
      ++goodsCart.foodsNum;
      ++thisCateData.selectNum;
      // totalPrice 总价  cost价格单价
      goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) + Number(thisData.cost)).toFixed(2));
      // console.log(thisData, Number(thisData.bagcost), 'sssssssssssssssssssssssssss')
      // 如果有餐盒费
      if (Number(thisData.bagcost) > 0) {
        goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) + Number(thisData.bagcost)).toFixed(2));
        goodsCart.totalBag = Number((Number(goodsCart.totalBag) + Number(thisData.bagcost)).toFixed(2));
      }
      if (goodsCart.itemList.length == 0) {
        ++thisData.selectNum;
        thisData.countPrice = Number((thisData.selectNum * Number(thisData.cost)).toFixed(2));
        goodsCart.itemList.push(JSON.parse(JSON.stringify(thisData)));
      } else {
        // 计算商品总额  如果购物车有这件商店
        for (var i = 0; i < goodsCart.itemList.length; i++) {
          // 如果点击的商品和购物车商品id一致
          if (thisData.id == goodsCart.itemList[i].id) {
            fl = 1;
            ++goodsCart.itemList[i].selectNum;
            // countPrice  单个商品总额
            goodsCart.itemList[i].countPrice = Number((goodsCart.itemList[i].selectNum * Number(goodsCart.itemList[i].cost)).toFixed(2));
          }
        }
        // 计算商品总额  如果购物车没有这件商店
        if (fl == 0) {
          thisData.selectNum = 0;
          ++thisData.selectNum;
          thisData.countPrice = Number((thisData.selectNum * Number(thisData.cost)).toFixed(2));
          console.log(thisData.countPrice)
          goodsCart.itemList.push(JSON.parse(JSON.stringify(thisData)));
        }
      }
      this.closeSacleDialog();
    } else {
      if (goodsCart.itemList.length == 0) return;
      // 如果小于0 清空
      if (--goodsCart.foodsNum <= 0) {
        goodsCart.foodsNum = 0;
        goodsCart.display = 'none';
      }
      if (--thisCateData.selectNum <= 0) {
        thisCateData.selectNum = 0;
      }
      // 总价-单价
      goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) - Number(thisData.cost)).toFixed(2));
      // 有包装盒的情况
      if (Number(thisData.bagcost) > 0) {
        goodsCart.totalPrice = Number((Number(goodsCart.totalPrice) - Number(thisData.bagcost)).toFixed(2));
        goodsCart.totalBag = Number((Number(goodsCart.totalBag) - Number(thisData.bagcost)).toFixed(2));
      }
      // 商品大于0的情况  -1 并且计算总价
      if (goodsCart.itemList.length > 0) {
        for (var i = 0; i < goodsCart.itemList.length; i++) {
          if (thisData.id == goodsCart.itemList[i].id) {
            --goodsCart.itemList[i].selectNum;
            goodsCart.itemList[i].countPrice = Number((goodsCart.itemList[i].selectNum * Number(goodsCart.itemList[i].cost)).toFixed(2));
          }
        }
      }
    }
    // 如果钱不够差多少起送
    if (Number(goodsCart.totalPrice) < limitcost) {
      goodsCart.text = '还差￥' + Number(limitcost - goodsCart.totalPrice).toFixed(0) + '起送';
    } else {
      goodsCart.text = '去结算';
    }
    // console.log(goodsCart)
    this.setData({
      cartData: goodsCart,
      goodsType: goodsType,
    })
    wx.setStorageSync('cartTemp', goodsCart);
    wx.setStorageSync('goodsType', goodsType);
    var totalPrice = Number(this.data.cartData.totalPrice);
    if (e.currentTarget.dataset.zy == 1) {
      this.addcart(totalPrice, this)
      this.heigtAuto(this);
    } else {
      this.addcart(totalPrice, this)
      this.minusHeight(this)
    }
    //显示已添加商品的数量
    this.showaddNum(this);
    this.numChange(this)
    // //    已满高度计算
  },
  /**
   * 优惠券的显示 封装方法 需要的 参数
   * 1、 totalPrice=>   购物车列表的总价格
   * 此方法是往购物车添加或者减少商品的时候优惠满减
   */
  addcart(totalPrice, that) {
    if (that.data.actiStatus <= 0 && that.data.reduction != '') {
      var fullMoneys = that.data.reduction._info;
      var isM = -1;
      for (var i = 0; i < fullMoneys.length; i++) {
        if (Number(totalPrice) >= Number(fullMoneys[i].full_money)) isM = i;
      }
      var discountTip = '',
        full_money = 0,
        reduction_money = 0;
      if (isM == -1) {
        full_money = fullMoneys[0].full_money;
        reduction_money = fullMoneys[0].reduction_money;
        discountTip = "再加" + Number(Number(full_money - totalPrice).toFixed(2)) + "元减" + reduction_money + "元";
        that.setData({
          youhui: 0,
          reduction_id: ''
        })
      } else if (isM >= fullMoneys.length - 1) {
        console.log('=================')
        console.log(isM)
        full_money = fullMoneys[isM].full_money;
        reduction_money = fullMoneys[isM].reduction_money;
        discountTip = "已满" + full_money + ",结算减" + reduction_money + "元";
        that.setData({
          youhui: reduction_money,
          reduction_id: fullMoneys[isM].id
        })
      } else {
        full_money = fullMoneys[isM].full_money;
        reduction_money = fullMoneys[isM].reduction_money;
        var betweenMoney = Number(Number(fullMoneys[isM + 1].full_money) - Number(totalPrice)).toFixed(2);
        var reductionMoney = fullMoneys[isM + 1].reduction_money;
        discountTip = "已满" + full_money + ",结算减" + reduction_money + "元,再加" + betweenMoney + "元减" + reductionMoney + "元";
        this.setData({
          youhui: reduction_money,
          reduction_id: fullMoneys[isM].id
        })
      }
      that.setData({
        discountTip: discountTip,
      });
    }
  },
  /**
   *页面刷新之后显示已经添加商品的数量
   */
  showaddNum(that) {
    var arr = [];
    for (var i = 0; i < that.data.cartData.itemList.length; i++) {

      var v = that.data.cartData.itemList[i];
      if (typeof arr[v.id] == 'undefined') {
        arr[v.id] = v.selectNum;
      } else {
        arr[v.id] += parseInt(v.selectNum);
      }
    }
    for (var i in that.data.selectedCate.det) {
      // console.log(i);
      for (var j = 0; j < that.data.cartData.itemList.length; j++) {
        if (i == that.data.cartData.itemList[j].id) {
          that.data.selectedCate.det[i].selectNum = arr[i]
        }
      }
    }
    that.setData({
      selectedCate: that.data.selectedCate
    });
    console.log(that.data.selectedCate)
  },
  heigtAuto(that) {
    var that = this;
    setTimeout(function() {
      var reduction = that.data.reduction;
      var actNum = that.data.actNum;
      var num;
      var num2;
      if (actNum > 0) {
        num = 60;
      } else {
        num = 0;
      }
      if (reduction == '') {
        num2 = 0;
      } else {
        num2 = 50
      }
      var res = wx.getSystemInfoSync();
    //   var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - num - 88 + 1 - num2;
    //   that.setData({
    //     scrollHeight: scrollHeight,
    //   })
    }, 500)
  },
  /**
   * 减的时候高度自适应
   */
  minusHeight(that) {
    var that = this;
    setTimeout(function() {
      var foodsNum = that.data.cartData.foodsNum;
      var reduction = that.data.reduction;
      var actNum = that.data.actNum;
      var num;
      var num2;
      if (actNum > 0) {
        num = 60;
      } else {
        num = 0;
      }
      if (reduction == '') {
        num2 = 0;
      } else if (reduction != '' && foodsNum > 0) {
        num2 = 50;
      } else {
        num2 = 0;
      }
      var res = wx.getSystemInfoSync();
    //   var scrollHeight = (Number(res.windowHeight) * 750 / res.windowWidth) - 88 - num + 1 - num2;
    //   that.setData({
    //     scrollHeight: scrollHeight,
    //   })
    }, 100);
  },
  /**
   * 精准到两位小数点-------主要针对购物车 显示那块
   */
  numChange(that) {
    console.log('swojiushiwoshiyansebu7yiyangdeyanhuo')
    that.setData({
      sTotalPrice: Number(that.data.cartData.totalPrice).toFixed(2),
      sTotalBag: Number(that.data.cartData.totalBag).toFixed(2),
      // sPscost: Number(that.data.pscost).toFixed(2)
    });
    // console.log(that.data.sTotalPrice)
    // console.log(that.data.sTotalBag)
    // console.log(that.data.sPscost)
  }
})