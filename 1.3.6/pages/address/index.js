var app = getApp()
var util = require('../../utils/util.js')
Page({
    data: {
        showEdit: false,
        isAdd: false,
        hasAddr: false,
        pickerDefault: "请选择标签",
        bigadrDefault: "小区/写字楼/学校等",
        tagList: ["其它", '家', '公司', '学校'],
        addressList: false,
        editInfo: {},
        showMessage: false,
        messageContent: '',
        
    },
    
    onLoad: function(e) {
        
        console.log(e)
        if(e.isVip){
            this.setData({
                isVip:e.isVip
            })
        }
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: wx.getStorageSync('color')
      });
        wx.showLoading({
            'title': '加载中',
            'mask': true
        })
        var that = this,
            access_token = app._access_token || wx.getStorageSync('access_token');
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=addressInfo&access_token=" + access_token,
            method: 'GET',
            dataType: 'json',
            data: {},
            success: function(res) {
                var data = res.data.data;
                var hasAddr = false;
                if (!util.isEmpty(data)) {
                    hasAddr = true
                } else {
                    data = {}
                }
                that.setData({
                    addressList: data,
                    hasAddr: hasAddr
                })
            },
            fail: function(res) {},
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    redioTap: function(e) {
        if(this.data.isVip){
            return;
        }
        if (e.type == "tap") {
            var thisId = e.currentTarget.dataset.aid;
        } else if (e.type == "change") {
            var thisId = e.detail.value;
        } else {
            return;
        }
        var thisInfo = this.data.addressList;
        if (thisInfo[thisId].default == 1) {
            wx.navigateBack({
                delta: 1
            })
        } else {
            var that = this;
            wx.request({
                url: app._host + "/index.php?ctrl=wxapp&action=setDefaultAddr&access_token=" + app._access_token,
                method: 'GET',
                data: {
                    id: thisId
                },
                success: function(res) {
                    wx.hideLoading();
                    if (res.data.status) {
                        wx.navigateBack({
                            delta: 1
                        })
                    } else {
                        wx.showToast({
                            title: res.data.msg
                        })
                    }
                },
                fail: function(res) {
                    wx.hideLoading();
                    wx.showToast({
                        title: "网络错误"
                    })
                },
                complete: function(res) {}
            })
        }
        console.log(e);
    },
    editAddress: function(e) {
        var thisId = e.currentTarget.dataset.aid;
        var data = this.data.addressList[thisId];
        this.setData({
            editInfo: data,
            showEdit: true,
            isAdd: false,
            pickerDefault: '',
            bigadrDefault: ''
        })
    },
    bindPickerChange: function(e) {
        var data = this.data.editInfo;
        data.tag = e.detail.value;
        this.setData({
            editInfo: data,
            pickerDefault: ''
        })
    },
    bindTapChooseLocation: function(e) {
        var that = this;
        wx.chooseLocation({
            success: function(res) {
                if (res.errMsg == "chooseLocation:ok") {
                    var data = that.data.editInfo;
                    data.lat = res.latitude;
                    data.lng = res.longitude;
                    data.bigadr = res.address;
                    that.setData({
                        editInfo: data,
                        bigadrDefault: ''
                    })
                }
            },
            cancel: function(res) {},
            fail: function(res) {},
            complete: function(res) {}
        })
    },
    inputBlur: function(e) {
        var tagName = e.currentTarget.dataset.name;
        var tagVal = e.detail.value;
        var data = this.data.editInfo;
        if (tagName == 'name') {
            data.contactname = tagVal;
        }
        if (tagName == 'phone') {
            data.phone = tagVal;
        }
        if (tagName == 'addr') {
            data.detailadr = tagVal;
        }
    },
    delAddr: function(e) {
        wx.showLoading({
            'title': '提交中',
            'mask': true
        })
        var thisId = e.currentTarget.dataset.aid;
        var that = this;
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=delAddress&access_token=" + app._access_token,
            method: 'GET',
            data: {
                id: thisId
            },
            success: function(res) {
                wx.hideLoading();
                if (res.data.status) {
                    var newList = that.data.addressList;
                    delete newList[thisId];
                    var hasAddr = that.data.hasAddr;
                    if (util.isEmpty(newList)) {
                        hasAddr = false
                    }
                    that.setData({
                        showEdit: false,
                        isAdd: false,
                        editInfo: {},
                        addressList: newList,
                        hasAddr: hasAddr
                    })
                } else {
                    app.showToast(res.data.msg)
                }
            },
            fail: function(res) {
                wx.hideLoading();
                app.showToast("网络错误")
            },
            complete: function(res) {}
        })
    },
    editAddr: function(e) {
        // wx.showLoading({ 'title': '提交中', 'mask': true })
        var data = this.data.editInfo;
        var thisId = e.currentTarget.dataset.aid;
        var that = this;
        console.log(!data.phone)
        if (!data.contactname) {
            this.setData({
                showMessage: true,
                messageContent: '请填写收货人姓名'
            })
            setTimeout(function() {
                that.setData({
                    showMessage: false,
                    messageContent: ''
                })
            }, 3000)
            return false;
        }
        if (!data.phone) {
            this.setData({
                showMessage: true,
                messageContent: '请填写手机号码'
            })
            setTimeout(function() {
                that.setData({
                    showMessage: false,
                    messageContent: ''
                })
            }, 3000)
            return false;
        } else if (!(/^1[34578]\d{9}$/.test(data.phone))) {
            this.setData({
                showMessage: true,
                messageContent: '手机号码有误，请重填'
            })
            setTimeout(function() {
                that.setData({
                    showMessage: false,
                    messageContent: ''
                })
            }, 3000)
            return false;
        }
        if (!data.bigadr) {
            this.setData({
                showMessage: true,
                messageContent: '请选择收货人地址'
            })
            setTimeout(function() {
                that.setData({
                    showMessage: false,
                    messageContent: ''
                })
            }, 3000)
            return false;
        }
        wx.request({
            url: app._host + "/index.php?ctrl=wxapp&action=saveAddress&access_token=" + app._access_token,
            method: 'POST',
            dataType: 'json',
            data: data,
            success: function(res) {
                console.log(res);
                // wx.hideLoading();
                if (res.data.status) {
                    var newList = that.data.addressList;
                    for (var k in newList) {
                        newList[k].default = 0;
                    }
                    var thisId = res.data.data.id.toString();
                    newList[thisId] = res.data.data;
                    that.setData({
                        showEdit: false,
                        isAdd: false,
                        hasAddr: true,
                        editInfo: {},
                        addressList: newList
                    })
                } else {
                    app.showToast(res.data.msg)
                }
            },
            fail: function(res) {
                // wx.hideLoading();
                app.showToast("网络错误")
            },
            complete: function(res) {}
        })
    },
    tapNewAddr: function(e) {
        this.setData({
            showEdit: true,
            isAdd: true,
            pickerDefault: "请选择标签",
            bigadrDefault: "小区/写字楼/学校等",
            editInfo: {}
        })
    },
    addrBack: function(e) {
        this.setData({
            showEdit: false,
            editInfo: {}
        })
    }
})