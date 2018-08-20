var app = getApp(),
    utils = require('../../utils/util.js'),
    API = require('../../utils/api.js');
Page({
    data: {
        title: '附近的店', //页面抬头
        haha: 'http://sj.repai.com/templates/m7/public/shopcenter/images/banner1.png',
        list: [
            {logo:'http://www.cqxtx.com.cn/images/logo210.png',title:'香天下成都旗舰店',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
            {logo:'https://pic.repaiapp.com/pic/83/75/ec/8375ecb14e892ae00a78b557dc335f45ebedf571.logo',title:'探鱼金鸡湖店',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
            {logo:'https://pic.repaiapp.com/pic/4e/eb/38/4eeb386ea733d4ff8ad9bdf2a616cdf7f418f31a.jpg',title:'232323',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
            {logo:'http://wx.qlogo.cn/mmopen/ChCs6YSVOGX9kg5dVmOwdRfI6QFV4a0PZOibMhM8ZyV9lKmu1oFhXbg3jY2eMy1GJJ7SuPZ4thb290Zk7H8SY4ekbfE9lMNyq/0',title:'短线王',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
            {logo:'https://pic.repaiapp.com/pic/7a/8c/92/7a8c92d52357e7a8066d18f5894ecb0e881365e6.jpg',title:'我的第二家店',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
            {logo:'https://pic.repaiapp.com/pic/1d/50/98/1d5098c404d10642589fc44db506fd23c5939ae3.jpg',title:'红南京的店',money:'68.00',address:'江苏省苏州市吴中区若水路1号',tel:'18362695424',distance:'17.00'},
        ],
        isLoading: true,
        isCodebg: false,
        isBottom: false,
        istemp: 'nearbg'
    },

    onLoad: function(options) {},
    onShow: function() {
    },
    calling: function(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel, //此号码并非真实电话号码，仅用于测试
        })
    },
    onPullDownRefresh() {　　
        wx.stopPullDownRefresh();
    },
    // goMap: function(e) {
    //     var options = {
    //         lng: e.currentTarget.dataset.lng,
    //         lat: e.currentTarget.dataset.lat,
    //         name: e.currentTarget.dataset.name,
    //         address: e.currentTarget.dataset.address
    //     }
    //     console.log(options)
    //     utils.goMap(options);
    // },
    reback: function(){
        wx.navigateBack({delta: 1})
    }
})
