Page({
  data: {
    coffeeData: [
      // 第一组图（星巴克咖啡）填充
      {
        id: 1,
        name: "星巴克 茶瓦那帝王云雾",
        isSelected: false,
        modal: {
          title: "星巴克 茶瓦那帝王云雾",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "0.15mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "0.15mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "15-25mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "15-25mg", isActive: false }
          ]
        }
      },
      {
        id: 2,
        name: "星巴克 热巧克力",
        isSelected: false,
        modal: {
          title: "星巴克 热巧克力",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "15mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "20mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "25mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "30mg", isActive: false }
          ]
        }
      },
      {
        id: 3,
        name: "星巴克 白巧克力",
        isSelected: false,
        modal: {
          title: "星巴克 白巧克力",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "0mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
          ]
        }
      },
      {
        id: 4,
        name: "星巴克 茶瓦那绿茶拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 茶瓦那绿茶拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "25mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "55mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "80mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "110mg", isActive: false }
          ]
        }
      },
      {
        id: 5,
        name: "星巴克 茶瓦那格雷伯爵红茶",
        isSelected: false,
        modal: {
          title: "星巴克 茶瓦那格雷伯爵红茶",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "40mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "40mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "80mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "80mg", isActive: false }
          ]
        }
      },
      {
        id: 6,
        name: "星巴克 茶瓦那皇家英式早餐拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 茶瓦那皇家英式早餐拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "40mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "40mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "80mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "80mg", isActive: false }
          ]
        }
      },
      {
        id: 7,
        name: "星巴克 茶瓦那格雷伯爵红茶拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 茶瓦那格雷伯爵红茶拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "40mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "40mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "80mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "80mg", isActive: false }
          ]
        }
      },
      {
        id: 8,
        name: "星巴克 氮气冷萃咖啡",
        isSelected: false,
        modal: {
          title: "星巴克 氮气冷萃咖啡",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "355ml", caffeine: "215mg", isActive: false },
            { type: "中杯", volume: "473ml", caffeine: "280mg", isActive: false }
          ]
        }
      },
      {
        id: 9,
        name: "星巴克 氮气拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 氮气拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "355ml", caffeine: "115mg", isActive: false },
            { type: "中杯", volume: "473ml", caffeine: "155mg", isActive: false }
          ]
        }
      },
      {
        id: 10,
        name: "星巴克 冰拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 冰拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "355ml", caffeine: "150mg", isActive: false },
            { type: "中杯", volume: "473ml", caffeine: "200mg", isActive: false },
            { type: "大杯", volume: "710ml", caffeine: "300mg", isActive: false }
          ]
        }
      },

      // 第二组图（美式、摩卡等）填充
      {
        id: 11,
        name: "星巴克 意式浓缩",
        isSelected: false,
        modal: {
          title: "星巴克 意式浓缩",
          selectedIndex: -1, 
          items: [
            { type: "中杯 solo", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯 doppio", volume: "473ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 12,
        name: "美式",
        isSelected: false,
        modal: {
          title: "美式",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "150mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "225mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "300mg", isActive: false }
          ]
        }
      },
      {
        id: 13,
        name: "摩卡",
        isSelected: false,
        modal: {
          title: "摩卡",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "90mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "95mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "175mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "185mg", isActive: false }
          ]
        }
      },
      {
        id: 14,
        name: "卡布奇诺",
        isSelected: false,
        modal: {
          title: "卡布奇诺",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 15,
        name: "白咖啡",
        isSelected: false,
        modal: {
          title: "白咖啡",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "130mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "130mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "195mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "195mg", isActive: false }
          ]
        }
      },
      {
        id: 16,
        name: "浓缩玛奇朵",
        isSelected: false,
        modal: {
          title: "浓缩玛奇朵",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 17,
        name: "焦糖玛奇朵",
        isSelected: false,
        modal: {
          title: "焦糖玛奇朵",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 18,
        name: "榛果玛奇朵",
        isSelected: false,
        modal: {
          title: "榛果玛奇朵",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },

      // 第三组图（各类拿铁、星冰乐等）填充
      {
        id: 19,
        name: "星巴克 法式焦糖拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 法式焦糖拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 20,
        name: "星巴克 熔岩巧克力拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 熔岩巧克力拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "95mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "100mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "185mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "195mg", isActive: false }
          ]
        }
      },
      {
        id: 21,
        name: "星巴克 肉桂拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 肉桂拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
        id: 22,
        name: "星巴克 提拉米苏拿铁",
        isSelected: false,
        modal: {
          title: "星巴克 提拉米苏拿铁",
          selectedIndex: -1, 
          items: [
            { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
            { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
            { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
            { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
          ]
        }
      },
      {
               id: 23,
                name: "星巴克 烟熏奶油糖拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 烟熏奶油糖拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "41mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "61mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "82mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "102mg", isActive: false }
                  ]
                }
              },
              {
                id: 24,
                name: "星巴克 烤全麦拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 烤全麦拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "39mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "58mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "78mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "97mg", isActive: false }
                  ]
                }
              },
              {
                id: 25,
                name: "星巴克 海盐焦糖摩卡",
                isSelected: false,
                modal: {
                  title: "星巴克 海盐焦糖摩卡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "58mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "87mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "116mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "145mg", isActive: false }
                  ]
                }
              },
              {
                id: 26,
                name: "星巴克 薄荷摩卡",
                isSelected: false,
                modal: {
                  title: "星巴克 薄荷摩卡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "56mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "84mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "112mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "140mg", isActive: false }
                  ]
                }
              },
              {
                id: 27,
                name: "星巴克 白巧克力摩卡",
                isSelected: false,
                modal: {
                  title: "星巴克 白巧克力摩卡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "54mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "81mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "108mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "135mg", isActive: false }
                  ]
                }
              },
              {
                id: 28,
                name: "星巴克 康宝蓝",
                isSelected: false,
                modal: {
                  title: "星巴克 康宝蓝",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "30ml", caffeine: "75mg", isActive: false }
                  ]
                }
              },
              {
                id: 29,
                name: "星巴克 热巧克力",
                isSelected: false,
                modal: {
                  title: "星巴克 热巧克力",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 30,
                name: "星巴克 白巧克力",
                isSelected: false,
                modal: {
                  title: "星巴克 白巧克力",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 31,
                name: "星巴克 茶瓦那格雷伯爵红茶拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 茶瓦那格雷伯爵红茶拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "30mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "45mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "60mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "75mg", isActive: false }
                  ]
                }
              },
              {
                id: 32,
                name: "星巴克 茶瓦那绿茶拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 茶瓦那绿茶拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "28mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "42mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "56mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "70mg", isActive: false }
                  ]
                }
              },
              {
                id: 33,
                name: "星巴克 茶瓦那皇家英式早餐拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 茶瓦那皇家英式早餐拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "32mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "48mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "64mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "80mg", isActive: false }
                  ]
                }
              },
              {
                id: 34,
                name: "星巴克 茶瓦那格雷伯爵红茶",
                isSelected: false,
                modal: {
                  title: "星巴克 茶瓦那格雷伯爵红茶",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "25mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "37mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "50mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "62mg", isActive: false }
                  ]
                }
              },
              {
                id: 35,
                name: "星巴克 茶瓦那帝王云雾",
                isSelected: false,
                modal: {
                  title: "星巴克 茶瓦那帝王云雾",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "26mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "39mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "52mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "65mg", isActive: false }
                  ]
                }
              },
              {
                id: 36,
                name: "星巴克 冷饮",
                isSelected: false,
                modal: {
                  title: "星巴克 冷饮",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 37,
                name: "星巴克 冰拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 冰拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "45mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "67mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "90mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "112mg", isActive: false }
                  ]
                }
              },
              {
                id: 38,
                name: "星巴克 冰美式咖啡",
                isSelected: false,
                modal: {
                  title: "星巴克 冰美式咖啡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "112mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "187mg", isActive: false }
                  ]
                }
              },
              {
                id: 39,
                name: "星巴克 冰卡布奇诺",
                isSelected: false,
                modal: {
                  title: "星巴克 冰卡布奇诺",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "50mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "75mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "100mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "125mg", isActive: false }
                  ]
                }
              },
              {
                id: 40,
                name: "星巴克 冷萃咖啡",
                isSelected: false,
                modal: {
                  title: "星巴克 冷萃咖啡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "60mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "90mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "120mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "150mg", isActive: false }
                  ]
                }
              },
              {
                id: 41,
                name: "星巴克 甄选冷萃咖啡",
                isSelected: false,
                modal: {
                  title: "星巴克 甄选冷萃咖啡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "65mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "97mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "130mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "162mg", isActive: false }
                  ]
                }
              },
              {
                id: 42,
                name: "星巴克 氮气拿铁",
                isSelected: false,
                modal: {
                  title: "星巴克 氮气拿铁",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "45mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "67mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "90mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "112mg", isActive: false }
                  ]
                }
              },
              {
                id: 43,
                name: "星巴克 氮气冷翠咖啡",
                isSelected: false,
                modal: {
                  title: "星巴克 氮气冷翠咖啡",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "237ml", caffeine: "75mg", isActive: false },
                    { type: "中杯", volume: "355ml", caffeine: "112mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "150mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "187mg", isActive: false }
                  ]
                }
              },
              {
                id: 44,
                name: "星巴克 星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 星冰乐",
                  selectedIndex: -1, 
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "30mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "40mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "50mg", isActive: false }
                  ]
                }
              },
              {
                id: 45,
                name: "星巴克 浓缩咖啡星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 浓缩咖啡星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "40mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "55mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "70mg", isActive: false }
                  ]
                }
              },
              {
                id: 46,
                name: "星巴克 香草星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 香草星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 47,
                name: "星巴克 焦糖星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 焦糖星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 48,
                name: "星巴克 摩卡星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 摩卡星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "35mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "48mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "60mg", isActive: false }
                  ]
                }
              },
              {
                id: 49,
                name: "星巴克 巧克力星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 巧克力星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "20mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "28mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "35mg", isActive: false }
                  ]
                }
              },
              {
                id: 50,
                name: "星巴克 抹茶星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 抹茶星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "25mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "35mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "45mg", isActive: false }
                  ]
                }
              },
              {
                id: 51,
                name: "星巴克 草莓轻乳酪星冰乐",
                isSelected: false,
                modal: {
                  title: "星巴克 草莓轻乳酪星冰乐",
                  selectedIndex: -1,
                  items: [
                    { type: "小杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "中杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 52,
                name: "星巴克 冷萃浮乐朵",
                isSelected: false,
                modal: {
                  title: "星巴克 冷萃浮乐朵",
                  selectedIndex: -1,
                  items: [
                    { type: "中杯", volume: "355ml", caffeine: "185mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "245mg", isActive: false }
                  ]
                }
              },
              {
                id: 53,
                name: "星巴克 绵云冷萃",
                isSelected: false,
                modal: {
                  title: "星巴克 绵云冷萃",
                  selectedIndex: -1,
                  items: [
                    { type: "中杯", volume: "355ml", caffeine: "170mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "225mg", isActive: false }
                  ]
                }
              },
              {
                id: 54,
                name: "星巴克 冰摇红莓黑加仑",
                isSelected: false,
                modal: {
                  title: "星巴克 冰摇红莓黑加仑",
                  selectedIndex: -1,
                  items: [
                    { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              },
              {
                id: 55,
                name: "星巴克 冰摇芒果木槿花",
                isSelected: false,
                modal: {
                  title: "星巴克 冰摇芒果木槿花",
                  selectedIndex: -1,
                  items: [
                    { type: "中杯", volume: "355ml", caffeine: "0mg", isActive: false },
                    { type: "大杯", volume: "473ml", caffeine: "0mg", isActive: false },
                    { type: "超大杯", volume: "592ml", caffeine: "0mg", isActive: false }
                  ]
                }
              }
            ],
            showModal: false,
            currentModal: {}
          },
        
          handleItemTap(e) {
            const index = e.currentTarget.dataset.index;
            const selectedCoffee = this.data.coffeeData[index];
        
            // 重置所有咖啡的选中状态
            const updatedList = this.data.coffeeData.map((item, i) => {
              item.isSelected = i === index;
              return item;
            });
        
            this.setData({
              coffeeData: updatedList,
              currentModal: selectedCoffee.modal,
              showModal: true
            });
          },
        
          selectCupType(e) {
            const index = e.currentTarget.dataset.index;
            const title = this.data.currentModal.title;
            
            // 找到当前操作的咖啡项
            const coffeeIndex = this.data.coffeeData.findIndex(item => item.modal.title === title);
            if (coffeeIndex !== -1) {
              // 更新当前咖啡项的杯型选中状态
              const updatedCoffeeData = [...this.data.coffeeData];
              updatedCoffeeData[coffeeIndex].modal.items.forEach((item, i) => {
                item.isActive = i === index;
              });
              
              // 更新选中索引
              updatedCoffeeData[coffeeIndex].modal.selectedIndex = index;
              
              // 更新数据
              this.setData({
                coffeeData: updatedCoffeeData,
                currentModal: updatedCoffeeData[coffeeIndex].modal
              });
            }
          },
        
          closeModal() {
            this.setData({
              showModal: false
            });
          },
        
          confirmSelection() {
            const { title, selectedIndex, items } = this.data.currentModal;
            if (selectedIndex === -1) {
              wx.showToast({
                title: "请选择一个杯型",
                icon: "none"
              });
              return;
            }
            const selectedCup = items[selectedIndex];
            wx.showToast({
              title: `已选择${title}的${selectedCup.type}杯型`,
              icon: "none"
            });
            this.closeModal();
          },
        
          toHome() { /* 跳转首页逻辑 */ },
          toCoffeeRecord() { /* 跳转咖啡记录逻辑 */ },
          toMy() { /* 跳转我的逻辑 */ }
        });