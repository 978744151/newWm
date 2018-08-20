// pages/index/index.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		list: [
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974456760685148.png'},
			{ src:' https://pic.repaiapp.com/static/png/20180103/18/1514974474301985057.png'},
			{ src:' https://pic.repaiapp.com/static/png/20180103/18/1514974489668934848.png'},
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974501579310150.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974513058525448.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974525028197102.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974535975395699.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974548358565650.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974560511825356.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974571001745751.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974590794889754.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974601528119950.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974611434125755.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974621171615450.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974631337252101.png' },
			{ src: 'https://pic.repaiapp.com/static/png/20180103/18/1514974640982304852.png' },
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let that=this;
		let len = that.data.list.length - 1
		let maxLeft = -(len * 449-180)
		that.setData({
			maxLeft: maxLeft
		})
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

	},
	makePhone:function(){
		wx.makePhoneCall({
      phoneNumber: '0512-81662185',
		})
	}

})