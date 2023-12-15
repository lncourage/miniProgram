// components/heade/heade.js
import backIcon from "./source/icon/backIcon"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      default: " "
    },
    isGame: {
      type: Boolean,
      default: false
    },
    //是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    top: null,
    //计算属性
    icon: '',
    TitleStyle: null,
    showBack:true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //点击返回按钮处理
    handleback() {
      console.log("back")
      wx.navigateBack({
        animationDuration: 300
      })
      try {
        // this.$emit('handleBack')
        this.triggerEvent("handleBack")
      } catch {

      }
    },
    //设置顶部返回导航格式
    TitleStyle: function () {
      let menuButtonInfo = wx.getMenuButtonBoundingClientRect()
      this.setData({
        top:menuButtonInfo.top + menuButtonInfo.height,
        TitleStyle: ` heigt: ${menuButtonInfo.height}px;top: ${menuButtonInfo.top}px;line-height: ${menuButtonInfo.height}px`
      })
    },
    icon: function (data) {
      console.log(this.data.isGame)
      this.setData({
        icon: `background: url(${this.data.isGame ? backIcon[0] : backIcon[1]}) center center no-repeat;backgroundSize: 100% 100%`,
      })
    }

  },

  lifetimes: {
    attached: function () {
      //
      this.icon()
      this.TitleStyle()


    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  }
})