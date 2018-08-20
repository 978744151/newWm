/**

 * 模块说明
  
 * @module 堂食、外卖、自提 =>订单
 * 
 * @method getOrderInfo 获取订单信息
 * 
 * @method submitOrder 提交订单

 */

const app = getApp();
const utils = require('./util.js');

/***
     * @method getData  获取店铺会员信息
     * @param {Object}  params 用户{id:shopId,access_token:''} 店铺ID，用户ACCESS_TOKEN
     * @param {String} orderType 自提 or 外卖 or 堂食
     * @return {Object} AJAX数据
     **/

function getData(params, orderType){
    return new Promise((resolve, reject)=>{
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=shopcart",
            method: 'GET',
            data: params,
            success: function (res) {
                if (res.data.status) {
                    resolve(res.data.data)
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            },
            fail: reject,
            complete: function () {}
        })
    })
    
}



module.exports = {
    /***
     * @method getOrderInfo 设置订单页信息
     * @param {Object}  that  页面THIS
     * @param {Object}  params 用户{id:shopId,access_token:''} 店铺ID，用户ACCESS_TOKEN
     * @param {Object}  discount 折扣信息{useMoney:'0',youhui:''} 优惠券抵扣   优惠金额
     * @param {String}  orderType 自提 or 外卖 or 堂食
     * @return {}
     **/
    getOrderInfo: function (that, params,discount,orderType){
        console.log(that, params, discount, orderType)
        getData(params,orderType).then((res)=>{
          console.log(res)
            let data = res,
                value = wx.getStorageSync(orderType),
                copyValue = JSON.parse(JSON.stringify(value)),
                address = false,
                useMoney = parseFloat(discount.useMoney),  //优惠券金额
                youhui = parseFloat(discount.youhui),
                disAmount;

            if (!utils.isEmpty(data.deaddress)) {
                address = data.deaddress
            }

            let baseAmount = parseFloat(value.totalPrice) * parseFloat(data.memberCard.discount),//基础金额 = (商品单价x数量 + 餐盒费x数量) * 会员折扣；
                mjAmount = parseFloat(youhui); //满减金额

            value.totalPrice = (baseAmount - mjAmount - useMoney).toFixed(2);
            value.totalPrice < 0 ? value.totalPrice=0:'';       //如果小于0 就显示0

            disAmount = (parseFloat(copyValue.totalPrice) - baseAmount).toFixed(2);
         

            if (orderType == 'cartTemp') {        //如果是外卖就要添加运送费
                if (address){   //有地址才会加运费。
                    value.totalPrice = (parseFloat(value.totalPrice) + parseFloat(address.newpscost)).toFixed(2)
                    that.setData({
                        canps: data.deaddress.canps,
                    })
                }                
            }
            that.setData({
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
            wx.hideLoading()
            if (orderType !== 'cartTemp_zt') {
                that.showDialog();
            }
        }),(err)=>{
            wx.hideLoading()            
            throw new SyntaxError('oder.js getOrderInfo错误');
        }
    },
    /*****
     * 
     * 提交应该也写一个方法。
     *  
     *
     * 
     * */ 
}