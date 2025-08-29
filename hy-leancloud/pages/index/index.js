// index.js
const app = getApp()

Page({
    data:{
        username:'',
        password:'',
    },

    inputUsername(e){
        this.setData({
            username:e.detail.value,
        })
    },
    inputPassword(e){
        this.setData({
            password:e.detail.value,
        })
    },
    toregiste(){
        wx.navigateTo({
            url:'../register/register'+this.data.username,
        })
    },
})