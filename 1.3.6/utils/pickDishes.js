/**
 * 模块说明
 * 
 * @module 堂食、外卖、自提 =>选择菜品提交
 * 
 * @method tapPay  选择吃的东西去结算
 * 
 * */
var zynetwork = require('../zynetwork.js');
/**
 * @method isStoreOpen 门店是否营业
 * @param {Object}
 */
function isStoreOpen(that) {
  if (that.data.shopInfo.is_open == '0') {
    wx.showModal({
      title: '提示',
      content: '小店打烊啦,非常抱歉给您带来不便',
      showCancel: false
    })
    return;
  }
}

/**
 * @method discountAmount 判断优惠金额 (满减金额)
 * @param {Object}
 */
function discountAmount(that) {
  return that.data.youhui > 0 ? that.data.youhui : 0
}


/**
 * @method isTrue 是否满足去结算相应条件 堂食、外卖、自提
 * @param {Object}
 */
function isTrue(that, orderType) {
  if (orderType == 'createOrder_ts' || orderType == 'createOrder_zt') {
    if (that.data.cartData.totalPrice >= 0 || (that.data.cartData.foodsNum > 0)) {
      return true
    }
  } else if (orderType == 'createOrder') {

    if (that.data.cartData.totalPrice >= that.data.shopDet.limitcost && that.data.cartData.totalPrice >= 0 && (that.data.cartData.foodsNum > 0)) {
      return true;
    }
  }
  return false
}

/**
 * @method sendAmonut 调用API发送满减后订单金额判断可用优惠券
 * @param {Object}
 */
function sendAmonut(that, orderType) {

  let totalPrice = parseFloat(that.data.cartData.totalPrice);

  zynetwork.apiUrl('activity/getValidVouchersByPayMoney',
    {
      pay_money: (totalPrice - discountAmount(that)).toFixed(2)
    }, (res) => {
      if (res.status <= 0) {
        wx.setStorage({ key: "usableData", data: res.data });
      }

      let url = `/pages/${orderType}/index?youhui=${discountAmount(that)}&reduction_id=${reductionId(that)}&skuids=${skuids(that)}&hasReduction=${that.data.hasReduction}`;

      that.data.isScene ? url += '&tableid=' + that.data.sceneData.info.title : '';
      wx.navigateTo({
        url: url
      })
    });
}

/**
 * @method 
 * @param {Object}
 */
function skuids(that) {
  var itemList = that.data.cartData.itemList
  var skuids = '';
  for (var i in itemList) {
    if (itemList[i].skuId) {
      skuids += itemList[i].skuId + ','
    }
  }
  skuids = skuids.substr(0, skuids.lastIndexOf(','))
  return skuids;
}


/**
 * @method 
 * @param {Object}
 */
function reductionId(that) {
  return that.data.reduction_id > 0 ? that.data.reduction_id : '';
}


module.exports = {

  /***
   * @method tapPay 提交订单
   * @param {Object} 页面THIS
   * @param {String} 订单类型  ts 堂食 wm 外卖  zt 自提
   */
  tapPay: function (that, orderType) {
    isStoreOpen(that)
    if (isTrue(that, orderType)) {
      sendAmonut(that, orderType)
    }
  }
}