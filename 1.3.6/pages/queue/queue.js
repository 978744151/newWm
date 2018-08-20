var app = getApp();

Page({
    data: {
        tel:'1512222222',
        sceneimg: [
            {image:"https://pic.repaiapp.com/pic/13/66/a5/1366a5525c6c0e0ed456bdea9b96235b62da2d82.jpg"},
        ]
       
    },
    onLoad: function(options) {},
    calling: function(e) { //打电话
        wx.makePhoneCall({
            phoneNumber: this.data.tel, //此号码并非真实电话号码，仅用于测试
        })
    },

})