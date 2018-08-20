/**
 * 未授权页面 nolocation
 * ypf 2017-05-25
 */

var app = getApp();
Page({
    data: {
        tiptxt: '您选择“拒绝”授权您的公开信息，小程序将无法正常使用，请谅解!',
        btntxt: '重新授权'
    },
    onLoad: function() {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
    },
    onShow: function() {
        var _isLocation = wx.getStorageSync('isLocation'),
            _isUserInfo = wx.getStorageSync('isUserInfo');
        console.log(_isLocation, _isUserInfo)
        if (_isLocation && _isUserInfo) {
            wx.reLaunch({
                url: '/pages/index/index'
            })
        }
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    aginPower: function() {
        var that = this;
        wx.openSetting({
            success: function(res) {
                console.log(res);
                var _isLocation = res.authSetting["scope.userInfo"],
                    _isUserInfo = res.authSetting["scope.userLocation"];
                console.log('-------点击授权对话框回调 start----------')
                console.log(_isLocation, _isUserInfo);
                wx.setStorageSync('isLocation', res.authSetting["scope.userInfo"]);
                wx.setStorageSync('isUserInfo', res.authSetting["scope.userLocation"]);
                console.log('-------点击授权对话框回调 end------------')
                if (_isLocation && _isUserInfo) {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    })
                } else if (!_isLocation && _isUserInfo) {
                    that.setData({
                        tiptxt: '您选择“拒绝”授权您的公开信息，小程序将无法正常使用，请谅解',
                        btntxt: '重新授权'
                    })
                } else if (_isLocation && !_isUserInfo) {
                    that.setData({
                        tiptxt: '检测到您没有打开小程序的定位权限，是否去设置打开？ !',
                        btntxt: '重新定位'
                    })

                } else {
                    that.setData({
                        tiptxt: '您选择“拒绝”授权您的公开信息，小程序将无法正常使用，请谅解!',
                        btntxt: '重新授权'
                    })
                }
            }
        })
    },
    authSetting: function() {
        wx.getSetting({
            success: function(res) {
                console.log(res);
                var _isLocation = res.authSetting["scope.userInfo"],
                    _isUserInfo = res.authSetting["scope.userLocation"];
                console.log('-------点击授权对话框回调 start----------')
                console.log(_isLocation, _isUserInfo);
                wx.setStorageSync('isLocation', res.authSetting["scope.userLocation"]);
                wx.setStorageSync('isUserInfo', res.authSetting["scope.userLocation"]);
                console.log('-------点击授权对话框回调 end------------')
                if (_isLocation && _isUserInfo) {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    })
                } else if (!_isLocation && _isUserInfo) {
                    that.setData({
                        tiptxt: '检测到您没有打开小程序的定位权限，是否去设置打开？',
                        btntxt: '重新定位'
                    })
                } else if (_isLocation && !_isUserInfo) {
                    that.setData({
                        tiptxt: '您选择“拒绝”授权您的公开信息，小程序将无法正常使用，请谅解!',
                        btntxt: '重新授权'
                    })

                } else {
                    that.setData({
                        tiptxt: '您选择“拒绝”授权您的公开信息，小程序将无法正常使用，请谅解!',
                        btntxt: '重新授权'
                    })
                }
            }
        })
    }

})
