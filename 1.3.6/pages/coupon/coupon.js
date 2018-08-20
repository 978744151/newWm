var zynetwork= require('../../zynetwork.js');
var shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isLoad:true,
      loadtxt:'刷新列表'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: wx.getStorageSync('color')
    });
    this.coupon();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
coupon:function(){
  shop_id = wx.getStorageSync('shop_id');
  var that = this;
  zynetwork.apiUrl('activity/vouchers',{},(res)=>{
    if(res.status<=0){
      if(res.data.length>0) {that.setData({flag: 0 })}
        else {that.setData({ flag: 1 })}
        that.setData({isLoad:false,myCouponData: res.data})
    }
  })
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  readyUse:function(){
    wx.navigateBack({})
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.coupon();
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {
    
  // },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
    
  // }
})