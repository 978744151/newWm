Page({

    data: {
        isLoad:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: wx.getStorageSync('color')
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that=this;
        setTimeout(function () {
            that.setData({
                isLoad:false,
                shopName:wx.getStorageSync('shopname'),
                data:wx.getStorageSync('data')
            })
        },500);
    },
    goOrder:function(){
        wx.navigateBack();
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
        wx.stopPullDownRefresh() //停止下拉刷新
     },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})