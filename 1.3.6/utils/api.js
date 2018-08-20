/**
 * 接口
 * ypf 2017-05-24
 */
var app = getApp(),
    utils = require('./util.js');
/**
 * [moduleGoPay 去付款]
 * @param  {[type]} that [this]
 * @param  {[type]} e    [e]
 * @return {[type]}      [description]
 */
let moduleGoPay = function(that, e,type='weChat') {
    return new Promise((resolve, reject) => {
        if (!that.showDialog()) {
            var orderid = e.currentTarget.dataset.orderid;
            wx.showLoading({ 'title': '提交中', 'mask': true })
            wx.request({
                url: app._host + "/index.php?ctrl=wxapp&action=orderPay&access_token=" + wx.getStorageSync('access_token'),
                method: 'POST',
                dataType: 'json',
                data: { orderid: orderid ,payFrom: type === 'balance'?'balance':'weChat'},
                success: function(res) {
                    wx.hideLoading();
                    if (res.statusCode != 200) {
                        // wx.showToast({ title: "网络错误请重试", icon: 'loding' })
                        app.showToast("网络错误请重试", "fail")
                        return;
                    }
                    var data = res.data;
                    if (data.status) {
                        // wx.showLoading({'title':'请求支付','mask':true})
                        if(type=='weChat'){
                            wx.requestPayment({
                                'timeStamp': data.data.timeStamp,
                                'nonceStr': data.data.nonceStr,
                                'package': data.data.package,
                                'signType': data.data.signType,
                                'paySign': data.data.paySign,
                                success: function(res) {
                                    wx.hideLoading();
                                    resolve(res)
                                },
                                fail: function(res) {
                                    wx.hideLoading();
                                    app.showToast("支付失败", "fail");
                                    reject(res)
                                },
                                complete: function(res) {
                                    wx.hideLoading();
                                }
                            })
                        }else {
                            resolve(data)
                        }

                    } else {
                        app.showToast(data.code);
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

    })
}
/**
 * [moduleGetOrderDetail 获取订单详情]
 * @param  {[type]} that    [this]
 * @param  {[type]} orderid [订单id]
 * @return {[type]}         [description]
 */
let moduleGetOrderDetail = function(that, orderid, callback) { //获取订单详情
    wx.request({
        url: app._host + "/index.php?ctrl=wxapp&action=orderInfo&access_token=" + wx.getStorageSync('access_token'),
        method: 'GET',
        dataType: 'json',
        data: { orderid: orderid },
        success: function(res) {
            var data = res.data.data;
            console.log(data)
            var zxlPrice = data.order.allcost
           
            console.log(zxlPrice)
            that.setData({
                orderInfo: data,
                orderid: orderid,
                zxlPrice
            })

            var _id = data.order.id;
            var _forList = data.order.statusInfo.btn;
            
            for (var i = 0; i < _forList.length; i++) {
                let temp = that.data.timeArray || {};
                if (_forList[i].hasOwnProperty('lessTime')) {
                    temp[_id] = { "num": _forList[i].lessTime, "str": _forList[i].name, "falg": true };
                    that.setData({
                        timeArray: temp
                    });
                }
            }
            utils.countdown(that);
            callback && callback();
        },
        fail: function(res) {
            app.showToast("获取订单详情失败");
        },
        complete: function(res) { wx.hideLoading() }
    })
}
/**
 * [moduleCancelOrder 取消订单]
 * @param  {[type]} that [this]
 * @param  {[type]} orderid  [订单id]
 * @return {[type]}      [description]
 */
let moduleCloselOrder = function(that, orderid) {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: '是否取消订单?',
            content: '',
            confirmText: "确认",
            confirmColor:'#2297e5',
            cancelText: "取消",
            success: function(res) {
                if (res.confirm) { //点击确认
                    wx.request({
                        url: app._host + "/index.php?ctrl=wxapp&action=closeOrder&access_token=" + wx.getStorageSync('access_token'),
                        method: 'GET',
                        dataType: 'json',
                        data: { orderid: orderid },
                        success: function(res) {
                            resolve(res)
                        },
                        fail: function(res) {
                            reject(res);

                        },
                        complete: function(res) {}
                    })
                }
            }
        })
    })

}
/**
 * [moduleCancelOrder 取消订单]
 * @param  {[type]} that [this]
 * @param  {[type]} orderid  [订单id]
 * @return {[type]}      [description]
 */
let moduleCancelOrder = function(that, orderid) {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: '是否取消订单?',
            content: '',
            confirmText: "确认",
            cancelText: "取消",
            success: function(res) {
                if (res.confirm) { //点击确认
                    wx.request({
                        url: app._host + "/index.php?ctrl=wxapp&action=cancelOrder&access_token=" + wx.getStorageSync('access_token'),
                        method: 'GET',
                        dataType: 'json',
                        data: { orderid: orderid },
                        success: function(res) {
                            resolve(res);
                        },
                        fail: function(res) {
                            reject(res);
                        },
                        complete: function(res) { wx.hideLoading() }
                    })
                }
            }
        })
    })

}

function IndexData(_that, e, dir, cb, types = null, storageCard = 'cartTemp') {
  var showorder = (typeof e.showorder == 'undefined') ? 0 : e.showorder;
  var that = _that;

  wx.request({
    url: app._host+"/index.php?ctrl=wxapp&action=shopInfo",
    method: 'GET',
    dataType: 'json',
    data: { id: app.shopId, lat: dir.lat, lng: dir.lng, version: app._version,mainType:types },
    success: function (res) {
      console.log(res)
      var data = res.data.data;
      var serverEndTime = parseInt(data.shopinfo.serverEndTime)*1000
      var nowTime = new Date().getTime()
      var DifferTime = parseInt(serverEndTime - nowTime)
      if(DifferTime <= 0 ){
        setTimeout(()=>{
          wx.hideTabBar()
        },100)
      }
    //   console.log(nowTime)  
    //   console.log(serverEndTime)
    //   console.log(DifferTime)
      if(!res.data.status){
          wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel:false,
              success:function(){
                  wx.navigateBack({
                      delta:1
                  })
              }
          })
      }
      
      if (storageCard == 'cartTemp_ts' || storageCard =='cartTemp'){
          if (res.data.data.shopinfo.is_open == '0') {
              wx.showModal({
                  title: '提示',
                  content: '小店打烊啦,非常抱歉给您带来不便',
                  showCancel: false
              })
          }
      }
      
      wx.setStorage({
        key: 'shopTheme',
        data: data.shopTheme,
      });
      wx.setStorage({
        key: "shop_id",
        data: data.shopinfo.id
      });
      wx.setStorage({
        key: "sendtype",
        data: data.shopinfo.shopDetail.sendType
      });
      wx.setStorage({
        key: "shopname",
        data: data.shopinfo.shopname
      });
      var cartData = that.data.cartData;
      if (Number(data.shopdet.limitcost) > 0) {
        cartData.text = "还差￥" + data.shopdet.limitcost + "起送";
      }
      var _cartData = wx.getStorageSync(storageCard);
      if (!utils.isEmpty(_cartData)) {
        cartData = _cartData;
      }
      // var goodsType = wx.getStorageSync('goodsType');
      var goodsType = res.data.data.goodstype;
      if (!utils.isJson(goodsType)) {
        goodsType = res.data.data.goodstype;
      }
      console.log(res.data.data.shopinfo.lat)
      console.log(res.data.data.shopinfo.lng)
      var itemselectedCate = JSON.parse(JSON.stringify(utils.sortByField(res.data.data.selectedCate.det, 'good_order')));
      that.setData({
        shopInfo: res.data.data.shopinfo,
        goodsType: goodsType,
        goodsTypeTemp: goodsType,
        goodsMenu: res.data.data.menu,
        shopDet: res.data.data.shopdet,
        selectedCate: res.data.data.selectedCate,
        selectedCateItem: itemselectedCate,
        cartData: cartData,
        cpage: showorder,
        _goodstype: res.data.data.goodstype,
        isOpen: res.data.data.shopinfo.is_open,
        pscost: res.data.data.psinfo.pscost,
        isTabbar: res.data.data.isTabbar,
        shopName1: res.data.data.shopinfo.shopname,
        shopLogo1: res.data.data.shopinfo.shoplogo,
        DifferTime:DifferTime,
        is_moudel: res.data.data.is_moudel,
        address: res.data.data.shopinfo.address,
        phone:res.data.data.shopinfo.maphone,
        storelat:res.data.data.shopinfo.lat,
        storelng:res.data.data.shopinfo.lng
      })
      try {
        wx.setStorageSync('shopDetail', res.data.data.shopinfo.shopDetail);
        wx.setStorageSync('addressFlag', {
          'lat': res.data.data.shopinfo.lat,
          'lng': res.data.data.shopinfo.lng
        });
        wx.setStorageSync('goodsType', goodsType)
      } catch (e) { }
      // cb && cb(that)
    },
    fail: function (res) {
      console.log('-----------加载首页失败 --------------')
      console.log(res)
      console.log('-----------加载首页失败 end-----------')
    },
    complete: function (res) {
      var _anewCart = wx.getStorageSync('anewCart');
      console.log(utils.isEmpty(_anewCart))
      if (!utils.isEmpty(_anewCart)) {
        that.anewCart();
      }
      that.setData({
        isLoadIndex: false
      })
      cb && cb(that);
    }
})
}
/**
 * api 接口
 */

let onLogin = function(iv, encryptedData, shopId) {
    return new Promise((resolve, reject) => {
        wx.login({
            success: function(res) {
                if (res.code) {
                    wx.request({
                        url: app._host+'/index.php?ctrl=wxapp&action=onLogin',
                        data: {
                            code: res.code,
                            iv: iv,
                            encryptedData: encryptedData,
                            id: shopId,
                        },
                        success: function(res) {
                            resolve(res);
                        },
                        fail: function(res) {
                            reject(res);
                        }
                    })
                } else {
                    console.log('获取用户信息失败')
                }
            }
        })
    })
}

const getShopInfo = function(id) {
    return new Promise((resolve, reject) => {
        const dir = wx.getStorageSync('dir'),
            _lat = dir.lat,
            _lng = dir.lng;
        wx.request({
            url: app._host+"/index.php?ctrl=wxapp&action=shopInfo",
            method: 'GET',
            dataType: 'json',
            data: { id: id, lat: _lat, lng: _lng },
            success: function(res) {
                if (res) {
                    resolve(res);
                } else {
                    reject(res);
                }
            }
        })
    })
}

const getOrderList = function(id, page) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: app._host+"/index.php?ctrl=wxapp&action=orderList",
            method: 'GET',
            dataType: 'json',
            data: { id: id, page: page },
            success: function(res) {
                resolve(res)
            },
            complete: function(res) {
                reject(res);
            }
        })
    })

}

/*
 * 快速支付入口
 */
const fastPay = function(params) {
    return new Promise((reslove, reject) => {
        wx.request({
            url: app._host + '/index.php?ctrl=wxapp&action=transfer&access_token=' + params.access_token,
            method: 'POST',
            dataType: 'json',
            data: params,
            success: reslove,
            fail: reject,
        })
    })
}

/*
 * 微信支付
 */
const wechatPay = function(params) {
    return new Promise((resolve, reject) => {
        wx.requestPayment({
            'timeStamp': params.timeStamp,
            'nonceStr': params.nonceStr,
            'package': params.package,
            'signType': params.signType,
            'paySign': params.paySign,
            success: resolve,
            fail: reject,
        })
    })
}

/**
 * 获取快速买单的信息
 */
const getFastInfo = function(params) {
    console.log(params)
    return new Promise((resolve, reject) => {
        wx.request({
            url: app._host + '/index.php?ctrl=wxapp&action=transferInfo',
            method: 'GET',
            dataType: 'json',
            data: params,
            success: resolve,
            fail: reject,
        })
    })
}


const getFastTokenInfo = function(that) {
    return new Promise((resolve, reject) => {
        wx.login({
            success: function(res) {
                wx.getUserInfo({
                    success: function(info) {
                        wx.request({
                            method: 'POST',
                            dataType: 'json',
                            url: app._host + '/index.php?ctrl=wxapp&action=onLogin',
                            data: {
                                code: res.code,
                                iv: info.iv,
                                encryptedData: info.encryptedData,
                                id: app.shopId,
                            },
                            success: function(reslogin) {
                                if (!reslogin.data.status) {
                                    console.log(reslogin);
                                    app.showToast(reslogin.data.msg)
                                } else {
                                    var data = reslogin.data.data;
                                    const access_token = data.access_token;
                                    const shopid = app.shopId;
                                    app._access_token = access_token;
                                    wx.setStorageSync('access_token', access_token);
                                    that.setData({ access_token })
                                    // wechatLocation().then((locat) => {
                                    //     const lat = locat.latitude;
                                    //     const lng = locat.longitude;
                                    getFastInfo({ access_token, shopid }).then((fastres) => {
                                        resolve(fastres)
                                    }, (error) => {
                                        reject(error);
                                    })
                                    // }, (err) => {
                                    //     wx.reLaunch({
                                    //         url: '/pages/noLocation/index'
                                    //     })
                                    // })

                                }
                            },
                            fail: function(res) {
                                app.showToast(res.data.msg);
                            },
                        })
                    },
                    fail: function() {
                        wx.reLaunch({
                            url: '/pages/noLocation/index'
                        })
                        wechatLocation().then((res) => {

                        }, (err) => {

                        })
                    }
                })
            }
        })
    })
}

/**
 *对话框
 */
const showModal = function(parmas) {
    const DEFAULT = {
        title: '',
        content: '',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#666666',
        confirmText: '确定',
        confirmColor: '#2297e5'
    };

    parmas = Object.assign({}, DEFAULT, parmas);
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: parmas.title,
            content: parmas.content,
            showCancel: parmas.showCancel,
            cancelText: parmas.cancelText,
            cancelColor: parmas.cancelColor,
            confirmText: parmas.confirmText,
            confirmColor: parmas.confirmColor,
            success: function(res) {
                if (res.confirm) {
                    resolve(res)
                } else if (res.cancel) {
                    reject(res)
                    console.log('用户点击取消')
                }
            },
            fail: function(res) {
                console.log('用户点击取消')
                reject(res)
            }
        })
    })
}


/**
 * [wechatRequestLogin 发送登录请求获取token值]
 * @param  {[type]} params [code,iv,encryptedData,id(店铺id)]
 * @return {[type]}        [description]
 */
const initShopInfo = function(params) {
  console.log(params)
    return new Promise((resolve, reject) => {
        wx.request({
            method: 'POST',
            dataType: 'json',
            url: app._host + '/index.php?ctrl=wxapp&action=shopIndex',
            data: params,
            success: resolve,
            fail: reject,
        })
    })
}


// code: params.code,
// iv: params.iv,
// encryptedData: params.encryptedData,
// id: params.shopId,

/**
 * [wechatRequestLogin 发送登录请求获取token值]
 * @param  {[type]} params [code,iv,encryptedData,id(店铺id)]
 * @return {[type]}        [description]
 */
const wechatRequestLogin = function(params) {
    return new Promise((resolve, reject) => {
        wx.request({
            method: 'POST',
            dataType: 'json',
            url: app._host + '/index.php?ctrl=wxapp&action=onLogin',
            data: params,
            success: resolve,
            fail: reject,
        })
    })

}

/**
 * [wechatLocation 微信获取定位信息]
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
const wechatLocation = function(params) {
    const DEFAULT = { type: 'wgs84' };
    params = Object.assign({}, DEFAULT, params);
    return new Promise((resolve, reject) => {
        wx.getLocation({
            type: params.type,
            success: resolve,
            fail: reject
        })
    })
}


/**
 * [wechatLogin 微信登陆]
 * @return {[type]} [description]
 */
const wechatLogin = function() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: resolve,
            fail: reject,
        })
    })
}

/**
 * [wechatGetUserInfo 微信获取个人信息]
 * @param  {Boolean} withCredentials [description]
 * @return {[type]}                  [description]
 */
const wechatGetUserInfo = function(withCredentials = false) {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            withCredentials: withCredentials,
            success: resolve,
            fail: reject
        })
    })
}

const wechatCheckSession = function() {
    return new Promise((resolve, reject) => {
        wx.checkSession({
            success: resolve,
            fail: reject,
        })
    })
}


// const wechatCheckSession = function() {
//     wechatCheckSession().then((res) => {
//         console.log(res);
//     }, (err) => {

//     })
// }

// code: params.code,
// iv: params.iv,
// encryptedData: params.encryptedData,
// id: params.shopId,
const wechatGetLogin = function() {
    var userinfo = {},
        code = {},
        location = {};
    return new Promise((resolve, reject) => {
        wechatLogin().then((res) => {
            code = res;
            console.log('获取用户登录信息')
            return wechatGetUserInfo(true);
        }, (err) => {
            console.log('用户登录失败')
        }).then((res) => { //获取用户信息
            userinfo = res;
            return wechatLocation();
        }, (err) => {
            console.log('用户取消或没有授权获取用户信息')
            return wechatLocation();
        }).then((res) => {
            location = res;
            return wechatRequestLogin({ code: code.code, iv: userinfo.iv, encryptedData: userinfo.encryptedData, id: app.shopId });
        }, (err) => {
            console.log('用户取消或没有授权获取用户信息且没有授权地理位置')
            wx.reLaunch({
                url: '/pages/noLocation/index'
            })
        }).then((res) => {
            var access_token = res.data.data.access_token;
            wx.setStorageSync('access_token', access_token);
            app._access_token = access_token;
            location.access_token = access_token;
            resolve(location)
        }, (err) => {
            console.log('请求登陆错误')
            reject(err);
        })
    })
}

module.exports = {
    moduleGoPay: moduleGoPay,
    moduleGetOrderDetail: moduleGetOrderDetail,
    moduleCloselOrder: moduleCloselOrder,
    moduleCancelOrder: moduleCancelOrder,
    onLogin: onLogin,
    getShopInfo: getShopInfo,
    getOrderList: getOrderList,
    fastPay: fastPay,
    wechatPay,
    getFastInfo,
    showModal,
    wechatLocation,
    getFastTokenInfo,
    wechatGetLogin,
    wechatCheckSession,
    IndexData: IndexData,
    initShopInfo: initShopInfo
}