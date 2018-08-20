
Page({
    data: {

    },
    onLoad: function(options) {

    },
    onShow: function() {

    },
    onHide: function() {

    },
    onPullDownRefresh() {
       wx.stopPullDownRefresh();
    },
    onReachBottom(){

    },
    calling: function(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel //此号码并非真实电话号码，仅用于测试
        })
    },
    reback: function(){
        wx.navigateBack({delta: 1})
    }
})
