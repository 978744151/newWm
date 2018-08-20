var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cpage: 0,
  },

  onLoad: function (options) {
    app.editTabBar();
  },

  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
    changePage: function(e) {
        var page = e.currentTarget.dataset.page;
        this.setData({
            cpage: page
        })
    },
  onUnload: function () {},

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {
    
  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {
    
  // }
})