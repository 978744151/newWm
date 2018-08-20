// pages/recharge/recharge.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:{},  //页面数据
      itemIndex:null,  //当前选中充值金额Id 默认为第一个
      item:{},  //当前选中金额对应数据

  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      try{
          let list = wx.getStorageSync('recharge'),
              itemIndex = list.recharge_set[0].id,
              item = list.recharge_set[0]
          this.setData({
              list,
              itemIndex,
              item
          })
      } catch(e){
          wx.showModal({
              title: '提示',
              content: '系统出错',
              showCancel:false
          })
      }
  },
  select(e){
      this.setData({
          item:e.currentTarget.dataset.item,
          itemIndex:e.currentTarget.dataset.item.id
      })
  },
  nowPay(){
      let that = this;
      wx.request({
          url: app._host +'/index.php?ctrl=wxapp&action=memberCardRecharge',
          data:{
              id: app.shopId,
              recharge_set_id: that.data.itemIndex,
              version: app._version,
              access_token: wx.getStorageSync('access_token')
          },
          method:'GET',
          success:function(res){
              console.log(res)
              if(!res.data.status){
                  wx.showModal({
                      title: '提示',
                      content: res.data.msg,
                      showCancel:false
                  })
                  return;
              }
              that.wxPayment(res.data.data)
          }
      })
  },
  wxPayment(param){
      wx.requestPayment({
          timeStamp: param.timeStamp,
          nonceStr: param.nonceStr,
          package: param.package,
          signType: param.signType,
          paySign: param.paySign,
          success:function(res){
              app.showToast('充值成功', 'success')
              wx.navigateBack({
                  delta:1
              })
              app.getMemberCard();
          },
          fail:function(res){
              app.showToast('充值失败','fail')
          }
      })
  }
})