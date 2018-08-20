// pages/myVip/myVip.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     * param {boolean} isVip 用户是不是会员 false?'不是VIP':'是VIP'
     */
    data: {
        isVip: true,    //false 不是VIP
        data: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getData();
    },
    getData() {
        app.getMemberCard((res) => {
            console.log(res)
            if (JSON.stringify(res.card) == '{}') {
                res.card.background_img = 'https://pic.repaiapp.com/static/png/20180621/15/1529564737630151101.png'
            }
            this.setData({
                data: res,
                isVip: res.has_card == '1' ? true : false
            })
        })
    },
    goMemberCard() {
        if (this.data.data.has_card == '0') {
            return;
        }
        wx.navigateTo({
            url: '/pages/memberCard/memberCard',
        })
    },
    getPhoneNumber: function (e) {
        wx.showLoading({})
        let that = this;
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            let url = app._host + '/index.php?ctrl=wxapp&action=getMemberCard&access_token=' + wx.getStorageSync('access_token') + '&iv=' + e.detail.iv + '&encryptedData=' + e.detail.encryptedData + '&id=' + app.shopId
            wx.request({
                url: encodeURI(url),
                success: function (res) {
                    if (!res.data.status) {
                        app.showErrorModal(res.data.msg)
                    } else {
                        that.getData();
                    }
                },
                complete: function () {
                    wx.hideLoading()
                }
            })
        } else {
            wx.hideLoading()
        }
    },
    jumpLink(e) {
        if (this.data.data.has_card == '0' || this.data.data.has_card_set == '0') {
            wx.showModal({
                title: '提示',
                content: this.data.data.has_card_set == '0' ? '商家暂未开通会员卡功能' : '请开通会员卡',
                showCancel: false
            })
            return;
        }
        let url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url,
        })
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