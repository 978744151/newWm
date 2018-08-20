Page({

  /**
   * 页面的初始数据
   */
  data: {
    rShow: true,
    r2Show: false,
    state: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: wx.getStorageSync('color')
    });

    var noUse = false;
    if (options.vouchers_id == 'null' || options.vouchers_id == 0) {
      noUse = true;
    }


    this.setData({
      youhui: options.youhui,
      reduction_id: options.reduction_id,
      vouchers_id: options.vouchers_id,
      hasReduction: options.hasReduction,
      rShow: noUse,
    })
    this.setData({
      usableData: wx.getStorageSync('usableData'),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  //不使用代金券
  unUseFuc: function (e) {
    var useMoney = e.currentTarget.dataset.money;
    var youhui = this.data.youhui;
    var reduction_id = this.data.reduction_id
    this.setData({
      rShow: true,
      state: null,
    });
    var page = getCurrentPages();
    var prePage = page[page.length - 2];
    var vouchers_id = 0;
    prePage.setData({ useMoney, vouchers_id, youhui, reduction_id })
    wx.navigateBack({
      delta: 1
    })
    // wx.redirectTo({
    //   url: '/pages/createOrder/index?useMoney=' + useMoney + '&youhui=' + youhui + '&reduction_id=' + reduction_id
    // })

  },
  useCoupon: function (e) {
    console.log(e)
    this.setData({
      state: e.currentTarget.dataset.id,
      rShow: false,
    });
    //代金券的id
    var vouchers_id = e.currentTarget.dataset.vouchersid;
    console.log(vouchers_id)
    //可用的优惠
    var useMoney = e.currentTarget.dataset.money;
    //携带过来的满减的钱
    var youhui = this.data.youhui;
    var reduction_id = this.data.reduction_id;
    var hasReduction = this.data.hasReduction;

    //攜帶參數的方法
    var page = getCurrentPages();
    var prePage = page[page.length - 2];
    console.log(prePage)
    prePage.setData({ useMoney, vouchers_id, youhui, reduction_id , hasReduction})
    wx.navigateBack({
      delta: 1
    })
    // wx.redirectTo({
    //   url: '/pages/createOrder/index?useMoney=' + useMoney + '&vouchers_id=' + vouchers_id + '&youhui=' + youhui + '&reduction_id=' +reduction_id
    // })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  //
  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { }
})