/**
 * 商家详情 shopDetail
 * ypf 2017-05-24 
 */
let API = require('../../utils/api.js');
let app = getApp();
Page({
    data: {
        shopData: {},
        zhichi:false,
        version:app._version
    },
    onLoad: function() {
        this.setData({
            urls:wx.getStorageSync("urls")
        })
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
        try {
            var _shopDetail = wx.getStorageSync('shopDetail') || {};
            this.setData({
                shopData: _shopDetail
            })
        } catch (e) {}
        this.setData({
                acData:wx.getStorageSync('acData'),
        })
        console.log(_shopDetail)
    },
    // 跳转商家地图
    goMap:function(){
        var latitude = Number(wx.getStorageSync('addressFlag').lat);
        var longitude = Number(wx.getStorageSync('addressFlag').lng);
        var name = this.data.shopData.name;
        var address = this.data.shopData.address
        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            name: name,
            address: address,
        })
    },
    erweima: function () {
        wx.previewImage({

            urls: [this.data.urls] // 需要预览的图片http链接列表
        })
    },
    contact:function(){
        wx.navigateTo({
            url: '/pages/contact/contact'
        })
    },
    jishu: function () {
        this.setData({
            zhichi: !this.data.zhichi
        })
    },
    bg: function () {
        this.setData({
            zhichi: !this.data.zhichi
        })
    },

    onPullDownRefresh: function() {
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    onShareAppMessage: function() { //分享
        return {
            title: this.data.shopData.name,
            path: '/pages/shopDetail/index',
            success: function(res) {
                app.showToast("转发成功", 'success')
            },
            fail: function(res) {
                app.showToast("转发失败")
            }
        }
    },
    showSheetTel: function(e) { //展示电话列表
        let tels = e.currentTarget.dataset.tel;
        wx.showActionSheet({
            itemList: tels,
            success: function(e) {
                if (!e.hasOwnProperty('cancel')) { // 不是【取消】才拨打电话
                    wx.makePhoneCall({
                        phoneNumber: tels[e.tapIndex]
                    })
                }
            }
        })
    },
    showaptitudeImage: function(e) { //全屏预览营业执照
        if (this.data.shopData.hasOwnProperty('aptitudeImg')) {
            var current = Array(e.currentTarget.dataset.src) || [];
            console.log('-----------点击营业执照 start-------------');
            console.log(current)
            console.log('-----------点击营业执照 end----------------');
            wx.previewImage({
                current: current[0],
                urls: current
            })
        }
    },
    previewImage: function(e) { //全屏预览图片
        if (this.data.shopData.hasOwnProperty('shopImgs')) {
            var current = e.target.dataset.src;
            wx.previewImage({
                current: current,
                urls: this.data.shopData.shopImgs
            })
        }
    }
})
