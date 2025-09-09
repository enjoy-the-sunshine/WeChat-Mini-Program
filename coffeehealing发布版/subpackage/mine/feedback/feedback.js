// pages/feedback/index.js
Page({
  data: {
    // 表单数据
    selectedType: '',
    description: '',
    images: [],
    
    // 状态数据
    showTypeSelector: false,
    typeError: false,
    descError: false,
    canSubmit: false,
    submitSuccess: false,
    
    // 选项数据
    typeOptions: ['功能问题', '界面问题', '性能问题', '内容建议', '其他问题']
  },

  onLoad: function() {
    // 初始化表单状态
    this.updateSubmitButton();
  },

  // 切换类型选择器显示
  toggleTypeSelector: function() {
    this.setData({
      showTypeSelector: !this.data.showTypeSelector
    });
  },

  // 选择反馈类型
  selectType(e) {
    const selectedType = e.currentTarget.dataset.value;
    this.setData({
      selectedType,
      typeError: false,
      showTypeSelector: false // 选中后关闭下拉
    });
    this.updateSubmitButton();
  },

  // 输入问题描述
  onDescInput: function(e) {
    this.setData({
      description: e.detail.value,
      descError: false
    });
    this.updateSubmitButton();
  },
  
  // 选择图片
  chooseImage: function() {
    if (this.data.images.length >= 3) {
      wx.showToast({
        title: '最多上传3张图片',
        icon: 'none'
      });
      return;
    }

    const that = this;
    wx.chooseImage({
      count: 3 - that.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        const newImages = that.data.images.concat(tempFilePaths);
        that.setData({
          images: newImages
        });
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  // 更新提交按钮状态
  updateSubmitButton: function() {
    const canSubmit = this.data.selectedType && this.data.description.trim();
    this.setData({ canSubmit: !!canSubmit });
  },

  // 提交表单
  submitForm: function() {
    if (!this.validateForm()) {
      // 显示具体错误提示
      if (!this.data.selectedType) {
        wx.showToast({
          title: '请选择反馈类型',
          icon: 'none'
        });
        this.setData({ typeError: true });
      } else if (!this.data.description.trim()) {
        wx.showToast({
          title: '请输入问题描述',
          icon: 'none'
        });
        this.setData({ descError: true });
      }
      return;
    }

    // 模拟提交成功
    this.setData({ submitSuccess: true });
    
    // 3秒后重置表单
    setTimeout(() => {
      this.resetForm();
    }, 3000);
  },

  // 验证表单
  validateForm: function() {
    let isValid = true;
    
    if (!this.data.selectedType) {
      this.setData({ typeError: true });
      isValid = false;
    }
    
    if (!this.data.description.trim()) {
      this.setData({ descError: true });
      isValid = false;
    }
    
    return isValid;
  },

  // 重置表单
  resetForm: function() {
    this.setData({
      selectedType: '',
      description: '',
      images: [],
      typeError: false,
      descError: false,
      submitSuccess: false
    });
    this.updateSubmitButton();
  },
  
  onPageTap(e) {
    const targetClass = e.target.dataset.class;
    // 不是点击选择框或选项时，才关闭选择器
    if (this.data.showTypeSelector &&
        targetClass !== 'picker' &&
        targetClass !== 'type-option') {
      this.setData({
        showTypeSelector: false
      });
    }
  }
  
})