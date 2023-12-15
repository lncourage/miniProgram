// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataArray: [],
    voiceTimer: null,
  },
  //methods

  //获取语音的buffer数据
  loadAudio(url) {
    return new Promise((resolve) => {
      wx.request({
        url,
        responseType: "arraybuffer",
        success: (res) => {
          this.audioCtx.decodeAudioData(
            res.data,
            (buffer) => {
              console.log("返回buffer数据");
              resolve(buffer);
            },
            (err) => {
              console.error("decodeAudioData fail", err);
              reject();
            }
          );
        },
        fail: (res) => {
          console.error("request fail", res);
          reject();
        },
      });
    });
  },
  play() {
    //
    this.data.voiceTimer = setInterval(() => {
      this.draw();
    }, 16);
    this.source.start();
  },
  generate() {
    this.getBuffer();
  },
  stop() {
    this.source.stop();
  },
  //初始化canvas
  initCvs() {
    let _this = this;
    //获取页面canvas以及上下文
    wx.createSelectorQuery()
      .select("#canvas")
      .node((res) => {
        _this.cvs = res.node;
        _this.ctx = _this.cvs.getContext("2d");
      })
      .exec();
  },
  //初始化音频播放器
  initVoice() {
    this.audioCtx = wx.createWebAudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.data.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.connect(this.audioCtx.destination);
  },
  getBuffer() {
    this.loadAudio(
      "https://limitcg.oss-cn-beijing.aliyuncs.com/limitCG/voice/4%25vol%E7%9A%84%E6%B2%B3.mp3"
    ).then((buffer) => {
      const sourceCache = new Set();
      this.source = this.audioCtx.createBufferSource();
      console.log(this.source);
      this.source.connect(this.analyser);
      this.source.buffer = buffer;
      //执行缓存操作
      sourceCache.add(this.source);

      //监听音频播放完成
      this.source.onended = () => {
        sourceCache.delete(this.source);
        clearInterval(this.data.voiceTimer);
      };
      wx.showToast({
        title: "成功",
        icon: "none",
        duration: 1500,
      });
    });
  },
  //绘制
  draw() {
    if (!this.cvs) {
      setTimeout(() => {
        this.draw();
      }, 200);
      return;
    }

    const { width, height } = this.cvs;
    this.ctx.clearRect(0, 0, width, height);

    this.analyser.getByteFrequencyData(this.data.dataArray);

    const len = this.data.dataArray.length / 2.5; //截取数据长度
    const barWidth = width / len; //柱形条的宽度
    this.ctx.fillStyle = "#efa"; //颜色
    //绘制
    for (let i = 0; i < len; i++) {
      const data = this.data.dataArray[i];
      const barHeight = ((data / 255) * height) / 2.5;
      const x1 = i * barWidth + width / 2; //x左侧
      const x2 = width / 2 - (i + 1) * barWidth; //x右侧
      const y = height - barHeight;
      this.ctx.fillRect(x1, y, barWidth - 2, barHeight);
      this.ctx.fillRect(x2, y, barWidth - 2, barHeight);
    }
  },

  //开始蓝牙
  startBlueTooth() {
    wx.openBluetoothAdapter({
      success(res) {
        console.log("初始化蓝牙模块", res);
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false,
          interval: 0,
          success(res) {
            console.log("开始搜索附近蓝牙设备");
          },
        });
      },
    });
  },

  connectBlueTooth() {
    let _this = this;
    console.log("开始连接")
    wx.createBLEConnection({
      deviceId: _this.deviceId,
      success(res) {
        console.log("createBLEConnection", res);
        wx.stopBluetoothDevicesDiscovery();
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  // 断开连接
  closeConnect() {
    wx.closeBluetoothAdapter({
      success(res) {
        console.log("closeBluetoothAdapter", res);
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initVoice();
    this.initCvs();
    let _this = this;

    wx.onBluetoothDeviceFound((res) => {
      console.log("发现设备");
      console.log("onBluetoothDeviceFound", res);
      const { deviceId } = res.devices[0];
      console.log(deviceId);
      _this.deviceId = deviceId;
    });

    //
    wx.onBLEConnectionStateChange((res) => {
      console.log("onBLEConnectionStateChange", res);
    });
    wx.onBluetoothAdapterStateChange((res) => {
      console.log("onBluetoothAdapterStateChange", res);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
