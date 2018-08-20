//引入MD5加密文件
import Md5 from './md5.js';
var app = getApp();
function apiUrl(api='',params={},successCallback=function(){},errorCallback=function(){})
{
    if(typeof params.method == 'undefined') params.method = 'GET';
    var app_key=app_key = 'd5e1fba25bd40ed351194b7649a7778c';
    var api_url = 'https://api.xiaodian.in/Wechat/';
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
    var defaults={
        app_id: 'c86db0655067cbf38299369664a1425f',
        t: timestamp,
        sign: Md5.hexMD5(app_key+api+timestamp)
};
    //组装已有的参数
    params['access_token'] = app._access_token || wx.getStorageSync('access_token');
    for (var i in defaults) params[i]=defaults[i];
    wx.request({
        url:api_url+api,
        data:params,
        dataType:'json',
        method:params.method,
        header: {"Content-Type": "application/x-www-form-urlencoded"}, 
        success:res=>{
            successCallback(res.data)
        },
        fail:errorCallback
    })
};
module.exports={
    apiUrl:apiUrl
}
