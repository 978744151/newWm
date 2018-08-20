var app = getApp();
function apiUrl(params = {}, successCallback = function () { }, errorCallback = function () { }) {
  if (typeof params.method == 'undefined') params.method = 'GET';
  var api_url = app._host+'/index.php?ctrl=wxapp&';
  //组装已有的参数
  params['access_token'] = wx.getStorageSync('access_token') || '';
  if (params['access_token'] == '') {
    app.islogin(function (res) {
      params['access_token'] = res.data.data.access_token;
      wx.request({
        url: api_url,
        data: params,
        dataType: 'json',
        method: params.method,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: res => {
          successCallback(res.data)
        },
        fail: errorCallback
      })
    })
  } else {
    wx.request({
      url: api_url,
      data: params,
      dataType: 'json',
      method: params.method,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: res => {
        successCallback(res.data)
      },
      fail: errorCallback
    })
  }

};

function showMessage(that, msg) {
  if (that.data.showMessage) {
    return;
  }
  that.setData({
    showMessage: true,
    messageContent: msg
  })
  setTimeout(() => {
    that.setData({
      showMessage: false,
    })
  }, 3000)
}

module.exports = {
  apiUrl: apiUrl,
  showMessage: showMessage
}