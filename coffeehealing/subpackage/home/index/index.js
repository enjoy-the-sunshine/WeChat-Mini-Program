const app = getApp();

Page({
  data: {
    inputMessage: '',
    messages: [],
    isLoading: false,
    scrollTop: 0,
    autoFocus: false,
    hasMoreHistory: true,
    isLoadingHistory: false,
    pollingIntervalId: null, // 轮询定时器ID
    // 新增：存储三个提示问题（初始值为默认问题）
    quickQuestions: [
      "帮我分析下我的咖啡饮用情况。",
      "现在我还能喝一杯咖啡吗？",
      "不同人群喝咖啡有啥不同建议？"
    ]
  },

  onLoad: function() {
    this.setData({
      autoFocus: true
    });
  },

  onUnload: function() {
    // 页面卸载时清理定时器
    if (this.data.pollingIntervalId) {
      clearInterval(this.data.pollingIntervalId);
    }
  },

  onInput: function(e) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  sendMessage: function() {
    const message = this.data.inputMessage.trim();
    if (!message || this.data.isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message
    };
    const newMessages = [...this.data.messages, userMessage];
    
    this.setData({
      messages: newMessages,
      inputMessage: '',
      isLoading: true
    }, () => {
      this.scrollToBottom();
      this.callCozeAPI(message);
    });
  },

  sendQuickQuestion: function(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({
      inputMessage: question
    }, () => {
      this.sendMessage();
    });
  },

  callCozeAPI: function(message) {
    const that = this;
    
    wx.request({
      url: 'https://api.coze.cn/v3/chat',
      method: 'POST',
      header: {
        'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
        'Content-Type': 'application/json'
      },
      data: {
        bot_id: "7545298396384002086",
        user_id: "123456789",
        additional_messages: [
          {
            role: "user",
            type: "question",
            content_type: "text",
            content: message
          }
        ],
        stream: false
      },
      success: function(res) {
        if (res.data && res.data.code === 0) {
          let conversation_id = res.data.data.conversation_id;
          let chat_id = res.data.data.id;
          wx.showLoading({
            title: '思考中...',
            mask: true
          });
          that.pollStatus(chat_id, conversation_id);
        } else {
          that.setData({ isLoading: false });
          that.handleError(`API调用失败: ${res.data?.msg || '未知错误'}`);
        }
      },
      fail: function(err) {
        that.setData({ isLoading: false });
        that.handleError(`网络请求失败: ${err.errMsg}`);
      }
    });
  },

  pollStatus: function(chat_id, conversation_id) {
    const that = this;
    const maxAttempts = 20;
    const pollInterval = 3000;
    let attempts = 0;
    
    if (this.data.pollingIntervalId) {
      clearInterval(this.data.pollingIntervalId);
    }
    
    const intervalId = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        that.setData({ 
          isLoading: false,
          pollingIntervalId: null
        });
        wx.hideLoading();
        wx.showToast({
          title: '请求超时，请稍后重试',
          icon: 'none'
        });
        return;
      }
      
      wx.request({
        url: 'https://api.coze.cn/v3/chat/retrieve',
        method: 'GET',
        header: {
          'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
          'Content-Type': 'application/json'
        },
        data: {
          conversation_id: conversation_id,
          chat_id: chat_id
        },
        success: (statusRes) => {
          if (statusRes.data && statusRes.data.code === 0) {
            const status = statusRes.data.data.status;
            switch (status) {
              case 'completed':
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                that.getAgentMessage(chat_id, conversation_id);
                break;
              case 'in_progress':
                console.log('智能体处理中，继续等待...');
                break;
              case 'failed':
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                wx.showToast({
                  title: '智能体处理失败',
                  icon: 'none'
                });
                break;
              default:
                clearInterval(intervalId);
                that.setData({ 
                  isLoading: false,
                  pollingIntervalId: null
                });
                wx.hideLoading();
                wx.showToast({
                  title: `未知状态: ${status}`,
                  icon: 'none'
                });
                break;
            }
          } else {
            clearInterval(intervalId);
            that.setData({ 
              isLoading: false,
              pollingIntervalId: null
            });
            wx.hideLoading();
            wx.showToast({
              title: statusRes.data?.msg || '状态查询失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('状态查询请求失败:', err);
        }
      });
    }, pollInterval);
    
    this.setData({
      pollingIntervalId: intervalId
    });
  },

  getAgentMessage: function(chat_id, conversation_id) {
    const that = this;
    
    wx.request({
      url: 'https://api.coze.cn/v3/chat/message/list',
      method: 'GET',
      header: {
        'Authorization': `Bearer pat_zyStm62wwk7JH9aseDB52xii9mOfTqEfLp9mbgja46ZCkPJirRqWzNSpjPN4L5XX`,
        'Content-Type': 'application/json'
      },
      data: {
        conversation_id: conversation_id,
        chat_id: chat_id
      },
      success: function(res) {
        if (res.data && res.data.code === 0) {
          console.log(res)
          that.handleAgentMessages(res.data); // 调用核心消息处理方法
        } else {
          wx.showToast({
            title: '获取消息失败',
            icon: 'none'
          });
          that.handleSuccessResponse(res.data);
        }
      },
      fail: function(err) {
        console.error('获取消息请求失败:', err);
        wx.showToast({
          title: '网络错误，获取消息失败',
          icon: 'none'
        });
        that.handleSuccessResponse({});
      }
    });
  },

  // 核心修改：同时处理 answer（输出内容）和 follow_up（替换提示问题）
  handleAgentMessages: function(responseData) {
    console.log(responseData)
    if (responseData.data && responseData.data.length > 0) {
      // 1. 保留原有功能：收集 type 为 answer 的 content（用于输出和展示）
      const answerContents = [];
      // 2. 新增功能：收集 type 为 follow_up 的 content（用于替换提示问题）
      const followUpContents = [];
      
      // 遍历消息列表，同时收集两种类型的内容
      responseData.data.forEach(msg => {
        // 保留：处理 answer 类型，输出 content 到控制台
        if (msg.type === 'answer') {
          answerContents.push(msg.content);
          console.log('找到answer类型消息:', msg.content); // 输出answer内容（原有功能）
        }
        // 新增：处理 follow_up 类型，收集 content 用于替换提示
        if (msg.type === 'follow_up') {
          followUpContents.push(msg.content);
          console.log('找到follow_up类型消息:', msg.content);
        }
      });

      // ---------------------- 新增：替换三个提示问题 ----------------------
      if (followUpContents.length > 0) {
        let newQuickQuestions = [...this.data.quickQuestions]; // 复制原有提示数组
        // 按顺序替换（最多替换3个，避免数组越界）
        for (let i = 0; i < followUpContents.length && i < newQuickQuestions.length; i++) {
          newQuickQuestions[i] = followUpContents[i];
        }
        this.setData({
          quickQuestions: newQuickQuestions // 更新提示问题到页面
        });
      }

      // ---------------------- 保留：展示 answer 类型的消息到聊天界面 ----------------------
      const agentMessages = responseData.data.filter(msg => 
        msg.role === 'assistant' || msg.role === 'bear'
      );
      
      if (agentMessages.length > 0) {
        const latestMessage = agentMessages[agentMessages.length - 1];
        // 优先使用 answer 类型的最后一条内容（原有逻辑），无则用默认智能体消息
        const messageContent = answerContents.length > 0 
          ? answerContents[answerContents.length - 1] 
          : latestMessage.content;
        
        const botMessage = {
          id: Date.now().toString(),
          role: 'bear',
          content: messageContent // 聊天界面展示 answer 内容
        };
        
        const newMessages = [...this.data.messages, botMessage];
        this.setData({
          messages: newMessages
        }, () => {
          this.scrollToBottom();
        });
        return;
      }
    }
    
    this.handleSuccessResponse(responseData);
  },

  // 另一种似乎可行的方法
  handleSuccessResponse: function(responseData) {
    if (responseData.data && responseData.data.messages && responseData.data.messages.length > 0) {
      const messageContent = responseData.data.messages[0].content;
      const botMessage = {
        id: Date.now().toString(),
        role: 'bear',
        content: messageContent
      };
      const newMessages = [...this.data.messages, botMessage];
      this.setData({
        messages: newMessages
      }, () => {
        this.scrollToBottom();
      });
    } else {
      wx.showToast({
        title: '未收到有效回复',
        icon: 'none'
      });
    }
  },

  extractResponse: function(responseData) {
    if (responseData.data && responseData.data.messages && responseData.data.messages.length > 0) {
      return responseData.data.messages[0].content;
    }
    return '抱歉，我没有理解您的问题，请再试一次。';
  },

  handleError: function(errorMsg) {
    console.error('错误:', errorMsg);
    const errorMessage = { 
      id: (Date.now() + 2).toString(),
      role: 'bear', 
      content: '抱歉，暂时无法处理您的请求，请稍后再试。' 
    };
    const newMessages = [...this.data.messages, errorMessage];
    this.setData({
      messages: newMessages,
      isLoading: false
    }, () => {
      this.scrollToBottom();
    });
    wx.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000
    });
  },

  scrollToBottom: function() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.message-list').boundingClientRect();
    query.select('.message-container').boundingClientRect();
    query.exec((res) => {
      if (res && res.length >= 2) {
        const messageListHeight = res[0].height;
        const containerHeight = res[1].height;
        if (messageListHeight > containerHeight) {
          this.setData({
            scrollTop: messageListHeight - containerHeight
          });
        }
      }
    });
  },

  onScroll: function(e) {
    this.setData({
      currentScrollTop: e.detail.scrollTop
    });
  },

  onScrollToLower: function() {
    if (!this.data.isLoadingHistory && this.data.hasMoreHistory) {
      this.loadMoreHistory();
    }
  },

  loadMoreHistory: function() {
    this.setData({
      isLoadingHistory: true
    });
    setTimeout(() => {
      const historyMessages = [
        {
          id: (Date.now() - 10000).toString(),
          role: 'bear',
          content: '这是一条历史消息，显示更早的对话内容。'
        },
        {
          id: (Date.now() - 20000).toString(),
          role: 'user',
          content: '我想了解更多历史消息'
        }
      ];
      const newMessages = [...historyMessages, ...this.data.messages];
      const currentScrollTop = this.data.currentScrollTop || 0;
      const historyHeight = 200;
      this.setData({
        messages: newMessages,
        scrollTop: currentScrollTop + historyHeight,
        isLoadingHistory: false,
        hasMoreHistory: false
      });
    }, 1000);
  }
});