
Page({
    data: {

    },
    onLoad: function() {
        var that = this;
    },
    onPullDownRefresh() {　　

     wx.stopPullDownRefresh() //停止下拉刷新

    },
    onReachBottom() {
        //下拉加载
    },
    onShow: function() { //首页展示
    },
    reback: function() {
        wx.navigateBack({ delta: 1 })
    }
})