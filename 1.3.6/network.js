import Md5 from './md5.js';

var app = new getApp();

var requestHandler = {
  params: {},
  success: function (res) {
    // success
  },
  fail: function () {
    // fail
  },
}
//GET请求
function GET(requestHandler) {
  request('GET', requestHandler)
}
//POST请求
function POST(requestHandler) {
  request('POST', requestHandler)
}
function request(method, requestHandler) {
  //注意：可以对params加密等处理
  var params = requestHandler.params;
  var API_URL = requestHandler.params.url
  wx.request({
    url: API_URL,
    data: params,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function (res) {
      //注意：可以对参数解密等处理
      requestHandler.success(res)
    },
    fail: function () {
      requestHandler.fail()
    },
    complete: function () {
      // complete
    }
  })
}
module.exports = {
  //url: 'https://dc.xiaodian.in/app/index.php?i=4&c=entry&m=ewei_shopv2&do=mobile&r=',
  // url:'http://120.55.16.75/app/index.php?i=4&c=entry&m=ewei_shopv2&do=mobile&r=', 
  url: 'https://api.xiaodian.in/Wechat/activity/', 
  GET: GET,
  POST: POST,

  curl:function(api = '' , params = {} , successCallback = function(){} , errorCallback = function(){})
  {
    var app_key = 'd5e1fba25bd40ed351194b7649a7778c';
    var api_url = 'https://api.xiaodian.in/Wechat/';
    var timestamp = Math.round(new Date().getTime() / 1000).toString();

    var defaults = {
      app_id: 'c86db0655067cbf38299369664a1425f',
      t: timestamp,
      sign: Md5.hexMD5(app_key+api+timestamp)
    };

    params['access_token'] = app._access_token || wx.getStorageSync('access_token');

    for(var i in defaults) params[i] = defaults[i]; 

    wx.request({
      url: api_url + api,
      data:params,
      dataType:'json',
      success: function(res){successCallback(res.data)},
      fail:errorCallback
    })
  }
}
