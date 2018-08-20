var utils = require('/utils/util.js');
// var config = require('/ext.json')
App({
    _host: 'https://xd.repai.com',
    _access_token: null,
    _version: null,
    shopId: null,
    isResh: 1, //主页是否刷新
    isList: 0, //订单列表是否刷新
    scene: null, //场景值
    discount: 1, //会员折扣
    userBalance: 0,
    onHideIndex: false,
    isWxappLogin: false,
    onLaunch: function () {

        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
        this._version = extConfig.user_version;


        if (wx.getUpdateManager) { //  小程序的强制刷新
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                console.log('请求完新版本信息的回调', res.hasUpdate)
            })
            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '版本升级提示',
                    content: '亲爱的客官,小程序已推出新版本,是否立即更新?',
                    success: function (res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate()
                        }
                    }
                })
            })
            updateManager.onUpdateFailed(function () {
                // 新的版本下载失败
                wx.showModal({
                    title: '更新提示',
                    content: '新版本下载失败',
                    showCancel: false
                })
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用小程序版本更新功能，请升级到最新微信版本后重试。'
            })
        }
        try {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
            // utils.isEmpty(extConfig)   !extConfig
            if (!extConfig) {
                //  this.shopId = 211;
                //  this.showErrorModal('请升级最新版本微信')
                var upgrade = true;
                wx.setStorageSync('upgrade', upgrade);
            } else {
                this.shopId = extConfig.shopId;
                var upgrade = false;
                wx.setStorageSync('upgrade', upgrade);
                !extConfig.isTest ? this._host = 'https://xd.repai.com' : this._host = 'https://sjdev.xiaodian.in';
            }
        } catch (e) {
            this.showToast('系统异常稍后重试')
        }
        wx.setStorageSync('anewCart', {});
        // this.getMemberCard();
    },
    onShow: function (e) {
        this.scene = e.scene;
    },
    checkToken: function (callback, oauthCallback) {
        var that = this;
        var token = wx.getStorageSync('access_token') || ''; //是否有token
        var location = wx.getStorageSync('isGetUserInfo') || 0; //是否获取用户信息
        var oauthCallback = oauthCallback || '';
        var _this = this;
        _this._access_token = token;
        if (token) {
            if (location == 0)
                wx.navigateTo({
                    url: '/pages/noUserInfo/noUserInfo?oauthCallback=' + oauthCallback
                })
            else
                if (typeof callback == 'function') return callback();
            return token;
        }
        // 登录
        wx.login({
            success: function (res) {
                var code = res.code;
                wx.request({
                    method: 'POST',
                    dataType: 'json',
                    url: _this._host + '/index.php?ctrl=wxapp&action=wxappLogin',
                    data: {
                        code: res.code,
                        id: _this.shopId
                    },
                    success: function (res) {
                        console.log(res)
                        if (res.statusCode != 200) {
                            _this.showErrorModal("数据错误请重试", '错误')
                        }
                        if (!res.data.status) {
                            _this.showToast(res.data.msg)
                        } else {
                            var data = res.data.data;
                            _this.setCache('access_token', data.access_token);
                            _this._access_token = data.access_token;
                            _this.getMemberCard()
                            if (location == 0)
                                wx.navigateTo({
                                    url: '/pages/noUserInfo/noUserInfo?oauthCallback=' + oauthCallback
                                })
                            else
                                if (typeof callback == 'function') return callback();
                        }
                    },
                    fail: function (res) {
                        _this.showToast("数据错误请重试")
                    },
                    complete: function () { }
                })
            }
        });
    },
    getAccessToken: function (callback, oauthCallback) {
        let that = this;
        var token = wx.getStorageSync('access_token') || '';

        wx.request({
            url: that._host + '/index.php?ctrl=wxapp&action=wxappJudgeToken&access_token=' + token,
            success: function (res) {
                if (res.data.code == '-100') {
                    wx.removeStorageSync('access_token')
                    wx.removeStorageSync('isGetUserInfo')
                }
                that.checkToken(callback, oauthCallback);
            },
            fail: function () {
                that.checkToken(callback, oauthCallback);
            }
        })
    },
    getWXlogin(callback) {
        var _this = this;
        return callback && callback();
        wx.checkSession({
            success: function () {
                callback && callback();
            },
            fail: function (res) {
                console.log('checkSession:fail');
                console.log(res);
                wx.login({
                    success: function (res) {
                        if (res.statusCode != 200) {
                            _this.showErrorModal("数据错误请重试", '错误')
                        }
                        if (!res.data.status) {
                            _this.showToast(res.data.msg)
                        } else {
                            var data = res.data.data;
                            _this.setCache('access_token', data.access_token);
                            _this._access_token = data.access_token;
                            callback && callback();
                        }
                    },
                    fail: function (res) {
                        _this.showToast("数据错误请重试")
                    },
                    complete: function () { }
                })
            }
        });
    },



    islogin: function (callback = '') {
        var _this = this;
        _this.getUser(callback);
        wx.checkSession({
            success: function () {
                console.log('inlogin');
                try {
                    var access_token = wx.getStorageSync('access_token');
                    if (access_token.length <= 0) {
                        _this.getUser(callback);
                    } else {
                        _this._access_token = access_token;
                    }
                } catch (e) {
                    _this.showToast('系统异常稍后重试')
                }
            },
            fail: function () {
                console.log('notlogin');
                _this.getUser(callback);
            }
        })
    },
    getUser: function (callback) {
        var _this = this;
        // wx.login({
        //     success: function(res) {
        //         console.log('---------login-----------')
        //         console.log(res);
        //         console.log('---------login end-----------')
        //         if (res.code) {
        //             _this.getUserInfo(function(info) {
        //                 wx.request({
        //                     method: 'POST',
        //                     dataType: 'json',
        //                     url: _this._host + '/index.php?ctrl=wxapp&action=onLogin',
        //                     data: {
        //                         code: res.code,
        //                         iv: info.iv,
        //                         encryptedData: info.encryptedData,
        //                         id: _this.shopId,
        //                     },
        //                     success: function(res) {
        //                         console.log('----------用户登录信息 start---------------')
        //                         console.log(res);
        //                         console.log('----------用户登录信息 end------------------')
        //                         if (res.statusCode != 200) {
        //                             _this.showErrorModal("数据错误请重试", '错误')
        //                         }
        //                         if (!res.data.status) {
        //                             console.log(res);
        //                             _this.showToast(res.data.msg)
        //                         } else {
        //                             var data = res.data.data;
        //                             _this.setCache('access_token', data.access_token);
        //                             // wx.setStorageSync('access_token', data.access_token);
        //                             _this._access_token = data.access_token;
        //                         }

        //                         typeof callback == "function" && callback(res);
        //                     },
        //                     fail: function(res) {
        //                         _this.showToast("数据错误请重试")
        //                     },
        //                     complete: function() {}
        //                 })
        //             })
        //         } else {
        //             console.log('-------获取用户登录态失败------')
        //             console.log(res)
        //             this.showToast('获取用户登录态失败' + res.errMsg)
        //         }
        //     }
        // });
    },
    getUserInfo: function (cb) {
        var _this = this;
        wx.login({
            success: function (res) {
                wx.getUserInfo({
                    withCredentials: true,
                    success: function (res) {
                        wx.setStorageSync('isUserInfo', true);
                        typeof cb == "function" && cb(res);
                    },
                    fail: function (res) {
                        wx.setStorageSync('isUserInfo', false);
                        wx.reLaunch({
                            url: '/pages/noUserInfo/noUserInfo'
                        })
                        console.log(res);
                    },
                    complete: function () {
                        _this.getUserLocation();
                    }
                });
            }
        })
    },
    showErrorModal: function (content, title) {
        wx.showModal({
            title: title || '提示',
            content: content || '未知错误',
            showCancel: false
        });
    },
    showToast: function (title, icon, duration) {
        var iconList = {
            fail: "/images/public/fail.png",
            success: "/images/public/success.png",
            question: "/images/public/question.png",
            time: "/images/public/time.png"
        }
        wx.showToast({
            title: title || '加载中',
            image: iconList[icon] || iconList['fail'],
            mask: true,
            duration: duration || 1500
        });
    },
    setCache: function (key, value) {
        if (!key || !value) {
            return;
        }
        wx.setStorage({
            key: key,
            data: value
        });
    },
    getCache: function (key) {
        if (!key) {
            return;
        }
        var _this = this;
        wx.getStorage({
            key: 'key',
            success: function (res) {
                _this._access_token = res.data;
            },
            fail: function (res) {
                _this.showErrorModal("获取缓存数据失败，请重试", '错误');
            }
        })
    },
    getUserLocation: function (callback, err) {
        var that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                console.log('---------定位信息 start-------------')
                console.log(res)
                console.log('---------定位信息 end---------------')
                that.lat = res.latitude;
                that.lng = res.longitude;
                var _isLocation = wx.getStorageSync('isLocation') || false;
                wx.setStorageSync('isLocation', true);
                wx.setStorageSync('dir', {
                    'lat': res.latitude,
                    'lng': res.longitude
                })
                wx.setStorageSync('addressFlag', {
                    'lat': res.latitude,
                    'lng': res.longitude
                })
                callback && callback(res);
                if (_isLocation == false) {
                    wx.redirectTo({
                        url: '/pages/index/index'
                    })
                }
            },
            fail: function (res) {
                console.log('---------定位失败信息 start-------------')
                console.log(res)
                console.log('---------定位失败信息 end----------------')
                wx.setStorageSync('isLocation', false);
                wx.setStorageSync('dir', {});
                wx.reLaunch({
                    url: '/pages/noLocation/index'
                })
                err && err(res)
            }
        })
    },
    editTabBar: function () {
        var tabbar = this.globalData.tabbar,
            currentPages = getCurrentPages(),
            _this = currentPages[currentPages.length - 1],
            pagePath = _this.__route__;
        (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
        for (var i in tabbar.list) {
            tabbar.list[i].selected = false;
            (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
        }
        _this.setData({
            tabbar: tabbar
        });
    },
    globalData: {
        lastTapTime: 0,
        userInfo: null,
        tabbar: {
            color: "#000000",
            selectedColor: "#dd2f3b",
            backgroundColor: "#ffffff",
            borderStyle: "#ffffff",
            list: [{
                pagePath: "/pages/index/index",
                text: "首页",
                iconPath: "/images/switch-icon/shouye_btn@3x.png",
                selectedIconPath: "/images/switch-icon/shouye_btn_selected@3x.png",
                selected: true
            },
            {
                pagePath: "/pages/myOrder/index",
                text: "订单",
                iconPath: "/images/switch-icon/square_btn@3x.png",
                selectedIconPath: "/images/switch-icon/square_btn_selected@3x.png",
                selected: false
            },
            {
                pagePath: "/pages/mine/index",
                text: "我的",
                iconPath: "/images/switch-icon/mine_btn@3x.png",
                selectedIconPath: "/images/switch-icon/mine_btn_selected@3x.png",
                selected: false
            }
            ],
            position: "bottom"
        }
    },


    /***
     * olist.js  olist_ts.js  orderDetail.js接口没有返回用户余额，所以暂时在这统一调用了会员接口,支付组件也通过app.has_card来判断是不是会员
     * 
     * 后期修改请注意会员中心部分页面也有调用这个接口。
     * 
     * **/


    getMemberCard(callback) { //获取会员卡信息
        let app = this;
        wx.request({
            url: app._host + `/index.php?ctrl=wxapp&action=memberCardInfo&id=${app.shopId}&version=${app._version}&access_token=` + wx.getStorageSync('access_token'),
            success: function (res) {
                if (res.data.status) {
                    callback && callback(res.data.data)
                    wx.setStorage({
                        key: 'recharge',
                        data: res.data.data.card,
                    })
                    if (res.data.data.has_card == '1') {
                        app.discount = res.data.data.card.discount;
                        app.userBalance = res.data.data.card.balance;
                        app.has_card = res.data.data.has_card
                    }
                } else {
                    callback && callback(res.data)

                }
            }
        })
    }
})